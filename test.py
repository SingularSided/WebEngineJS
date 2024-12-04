import pyaudio
import numpy as np
import simpleaudio as sa

THRESHOLD = 5000
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
ALARM_FILE = "alarm.wav"

def play_alarm():
    try:
        sa.WaveObject.from_wave_file(ALARM_FILE).play().wait_done()
    except:
        pass

def monitor_microphone():
    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    try:
        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            if np.linalg.norm(np.frombuffer(data, dtype=np.int16)) > THRESHOLD:
                play_alarm()
    except KeyboardInterrupt:
        pass
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

monitor_microphone()
