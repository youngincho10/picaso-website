/*
  PICASO KNOK — ESP32-S3 SuperMini + I2S MEMS microphone
  Baud 115200. Wiring: SCK=12, WS=11, SD=10, L/R=GND.
  Commands: CONNECT, ARM, DISARM.
  Impact output: {"event":"impact","score":54,"raw":123456}
*/
#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>

namespace {
constexpr i2s_port_t I2S_PORT = I2S_NUM_0;
constexpr int I2S_SCK = 12;
constexpr int I2S_WS = 11;
constexpr int I2S_SD = 10;
constexpr uint32_t SERIAL_BAUD = 115200;
constexpr uint32_t SAMPLE_RATE = 16000;
constexpr size_t DMA_SAMPLES = 256;
constexpr uint32_t CALIBRATION_MS = 1400;
constexpr uint32_t ARM_SETTLE_MS = 120;
constexpr uint32_t COOLDOWN_MS = 700;
constexpr uint32_t PEAK_HOLD_MS = 70;
constexpr int32_t MIN_TRIGGER_PEAK = 12000;
constexpr float NOISE_PEAK_MULTIPLIER = 4.0f;
constexpr float NOISE_RMS_MULTIPLIER = 3.2f;

bool armed = false;
bool microphoneReady = false;
uint32_t armedAt = 0;
uint32_t lastImpactAt = 0;
float noisePeak = MIN_TRIGGER_PEAK / NOISE_PEAK_MULTIPLIER;
float noiseRms = MIN_TRIGGER_PEAK / NOISE_RMS_MULTIPLIER;
double dcEstimate = 0.0;
String serialCommand;

struct AudioLevel {
  int32_t peak;
  float rms;
};

bool beginMicrophone() {
  const i2s_config_t config = {
    .mode = static_cast<i2s_mode_t>(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = DMA_SAMPLES,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0,
  };
  const i2s_pin_config_t pins = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD,
  };
  if (i2s_driver_install(I2S_PORT, &config, 0, nullptr) != ESP_OK) return false;
  if (i2s_set_pin(I2S_PORT, &pins) != ESP_OK) {
    i2s_driver_uninstall(I2S_PORT);
    return false;
  }
  i2s_zero_dma_buffer(I2S_PORT);
  return true;
}

AudioLevel readAudioLevel() {
  int32_t samples[DMA_SAMPLES];
  size_t bytesRead = 0;
  if (i2s_read(I2S_PORT, samples, sizeof(samples), &bytesRead, pdMS_TO_TICKS(120)) != ESP_OK || bytesRead == 0) {
    return {0, 0.0f};
  }
  const size_t count = bytesRead / sizeof(samples[0]);
  int32_t peak = 0;
  double squareSum = 0.0;
  for (size_t i = 0; i < count; ++i) {
    const int32_t sample = samples[i] >> 8;
    dcEstimate += (static_cast<double>(sample) - dcEstimate) * 0.0015;
    const int32_t centered = static_cast<int32_t>(sample - dcEstimate);
    const int32_t magnitude = abs(centered);
    if (magnitude > peak) peak = magnitude;
    squareSum += static_cast<double>(centered) * centered;
  }
  return {peak, count ? static_cast<float>(sqrt(squareSum / count)) : 0.0f};
}

void calibrateNoiseFloor() {
  const uint32_t startedAt = millis();
  float peakAverage = 0.0f;
  float rmsAverage = 0.0f;
  uint32_t blocks = 0;
  while (millis() - startedAt < CALIBRATION_MS) {
    const AudioLevel level = readAudioLevel();
    if (level.peak == 0) continue;
    peakAverage += level.peak;
    rmsAverage += level.rms;
    ++blocks;
  }
  if (blocks > 0) {
    noisePeak = max(peakAverage / blocks, 1.0f);
    noiseRms = max(rmsAverage / blocks, 1.0f);
  }
}

int scoreFromPeak(int32_t peak, float threshold) {
  if (peak <= threshold) return 1;
  const float ratio = max(static_cast<float>(peak) / threshold, 1.0f);
  const float decibelsAboveThreshold = 20.0f * log10f(ratio);
  return constrain(static_cast<int>(18.0f + decibelsAboveThreshold * 4.2f), 1, 100);
}

void sendImpact(int score, int32_t rawPeak) {
  Serial.printf("{\"event\":\"impact\",\"score\":%d,\"raw\":%ld}\n", score, static_cast<long>(rawPeak));
}

void handleCommand(String command) {
  command.trim();
  command.toUpperCase();
  if (command == "CONNECT" || command == "PING") {
    Serial.println(microphoneReady ? "KNOK_READY" : "MIC_ERROR");
  } else if (command == "ARM") {
    if (!microphoneReady) {
      Serial.println("MIC_ERROR");
      return;
    }
    armed = true;
    armedAt = millis();
    Serial.println("ARMED");
  } else if (command == "DISARM") {
    armed = false;
    Serial.println("DISARMED");
  }
}

void readSerialCommands() {
  while (Serial.available()) {
    const char incoming = static_cast<char>(Serial.read());
    if (incoming == '\n' || incoming == '\r') {
      if (!serialCommand.isEmpty()) {
        handleCommand(serialCommand);
        serialCommand = "";
      }
    } else if (serialCommand.length() < 48) {
      serialCommand += incoming;
    }
  }
}

void detectImpact() {
  const AudioLevel level = readAudioLevel();
  if (!armed || millis() - armedAt < ARM_SETTLE_MS) return;
  noisePeak = noisePeak * 0.995f + level.peak * 0.005f;
  noiseRms = noiseRms * 0.995f + level.rms * 0.005f;
  const float peakThreshold = max(static_cast<float>(MIN_TRIGGER_PEAK), noisePeak * NOISE_PEAK_MULTIPLIER);
  const float rmsThreshold = max(static_cast<float>(MIN_TRIGGER_PEAK) * 0.22f, noiseRms * NOISE_RMS_MULTIPLIER);
  const uint32_t now = millis();
  if (level.peak < peakThreshold || level.rms < rmsThreshold || now - lastImpactAt < COOLDOWN_MS) return;

  int32_t heldPeak = level.peak;
  const uint32_t holdStartedAt = millis();
  while (millis() - holdStartedAt < PEAK_HOLD_MS) {
    const AudioLevel heldLevel = readAudioLevel();
    if (heldLevel.peak > heldPeak) heldPeak = heldLevel.peak;
    readSerialCommands();
  }
  sendImpact(scoreFromPeak(heldPeak, peakThreshold), heldPeak);
  armed = false;
  lastImpactAt = millis();
}
}

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(500);
  microphoneReady = beginMicrophone();
  if (!microphoneReady) {
    Serial.println("MIC_ERROR");
    return;
  }
  calibrateNoiseFloor();
  Serial.printf("KNOK_READY PEAK_NOISE:%ld RMS_NOISE:%ld\n",
                static_cast<long>(noisePeak), static_cast<long>(noiseRms));
}

void loop() {
  readSerialCommands();
  if (!microphoneReady) {
    delay(100);
    return;
  }
  if (armed) {
    detectImpact();
  } else {
    const AudioLevel level = readAudioLevel();
    if (level.peak > 0) {
      noisePeak = noisePeak * 0.99f + level.peak * 0.01f;
      noiseRms = noiseRms * 0.99f + level.rms * 0.01f;
    }
  }
}