import json
import socket
import speech_recognition as sr

HOST = '127.0.0.1'
PORT = 65432

def start_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((HOST, PORT))
    sock.listen(5)
    conn, addr = sock.accept()

def close_server():
    sock.shutdown(socket.SHUT_RDWR)
    sock.close()
    print("closed")

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((HOST, PORT))
    sock.listen(5)
    conn, addr = sock.accept()

    r = sr.Recognizer()

    #r.recognize_google()

    mic = sr.Microphone()

    '''for mic in sr.Microphone.list_microphone_names():
        print(mic + "\n")'''

    mic = sr.Microphone(device_index=0)

    webpage_commands = [] # Just a test for now

    keep_running = True

    while keep_running:
        while conn:
            #print("ready")
            #while keyboard.is_pressed("alt"):
            print('Connected by ', addr)
            with mic as source:
                print("Listening...")
                r.pause_threshold = 0.2
                r.adjust_for_ambient_noise(source, duration=0.5)
                try:
                    audio = r.listen(source, phrase_time_limit=6)
                    spoken = r.recognize_google(audio)
                    print(spoken)

                    if spoken == "quit":
                        keep_running = False
                        conn.shutdown(socket.SHUT_RDWR)
                        sock.close()
                        print("closed")
                        break
                    else:
                        conn.sendall(bytes(spoken, 'utf-8'))

                except sr.UnknownValueError:
                    print("Couldn't understand voice input!")

if __name__ == '__main__':
    main()