#!/usr/bin/env python3

''' For now, just a simple server echo. '''
''' https://realpython.com/python-sockets/#application-client-and-server '''
''' https://docs.python.org/2/howto/sockets.html '''
''' https://www.journaldev.com/15906/python-socket-programming-server-client '''

import socket

HOST = '127.0.0.1'
PORT = 65432

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind((HOST, PORT))
sock.listen(5)
conn, addr = sock.accept()

x = 5

arr = ['test']

while conn:
    if x == 5:
        print('Connected by ', addr)
        x += 1
    while True:
        data = conn.recv(1024)
        if not data:
            break
        for command in arr:
            print(data)
            if data.decode('utf-8') == command:
                conn.sendall(bytes(command, 'utf-8'))
            else:
                conn.sendall(b'Command not found')
        #conn.sendall(data)