import speech_recognition as sr

r = sr.Recognizer()

#r.recognize_google()

mic = sr.Microphone()

'''for mic in sr.Microphone.list_microphone_names():
    print(mic + "\n")'''

mic = sr.Microphone(device_index=0)

webpageCommands = ["scroll down"] # Just a test for now

keep_running = True

while keep_running:
    with mic as source:
        print("Listening...")
        r.pause_threshold = 0.5
        r.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = r.listen(source, phrase_time_limit=5)
            spoken = r.recognize_google(audio)
            print(spoken)

            if spoken not in webpageCommands:
                print("Sorry, invalid command!")

            if spoken == "quit":
                keep_running = False
        except sr.UnknownValueError:
            print("Couldn't understand voice input!")