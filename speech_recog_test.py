import json
import speech_recognition as sr

def write_to_json(command):
    input = {}
    input['response'] = command
    array = ""

    with open('data.json', 'r+') as output_file:
        try:
            for line in output_file:
                array += line
            data = json.loads(array)
            print(data)
            data['response'] = command
            output_file.seek(0)
            json.dump(data, output_file, indent=4)
            print('finished')
        except json.decoder.JSONDecodeError:
            print("JSONDecodeError")

def read_from_json(spoken):
    array = ""
    try:
        with open('data.json', 'r+') as file:
            try:
                for line in file:
                    array += line
                data = json.loads(array)
                print(data)
                if spoken in data['page-data']:
                    write_to_json(spoken)
            except json.decoder.JSONDecodeError:
                print("json.decoder.JSONDecodeError")
    except FileNotFoundError:
        print("File does not exist!")

def main():
    r = sr.Recognizer()

    #r.recognize_google()

    mic = sr.Microphone()

    '''for mic in sr.Microphone.list_microphone_names():
        print(mic + "\n")'''

    mic = sr.Microphone(device_index=0)

    webpage_commands = [] # Just a test for now

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

                if spoken == "quit":
                    keep_running = False

                read_from_json(spoken)

            except sr.UnknownValueError:
                print("Couldn't understand voice input!")

if __name__ == '__main__':
    main()