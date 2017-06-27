# SteganographyJS

Steganography is the art of hiding data within other data. There are many types of steganography including image, audio and video. Whereas cryptography aims to make data encrypted and unreadable, steganography focuses on hiding the data and concealing it with in a carrier medium to avoid arousing suspicion.

This project demonstrates some basic LSB (Least Significant Bit) steganography. Each pixel in the noise.bmp file is broken down into pair of bits and each of these is then embedded in the least 2 significant bits of a separate carrier texture. By modifying only these bits, each r, g, and b value of a pixel in one of the stego-images will only change by a maximum of 3; leaving very little visual difference between the stego-image and the original texture.

Much in the same way, the noise.bmp file can be extracted and reassembled for the stego-images.

You can find the link to the repostory's GitHub Pages [here](https://thomas-james-rose.github.io/SteganographyJS/).