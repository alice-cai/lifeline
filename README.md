



# Lifeline

## Inspiration
One of the biggest roadblocks during disaster relief is reestablishing the first line of communication between community members and emergency response personnel. Whether it is the aftermath of a hurricane devastating a community or searching for individuals in the backcountry, communication is the key to speeding up these relief efforts and ensuring a successful rescue of those at risk. 

In the event of a hurricane, blizzard, earthquake, or tsunami, cell towers and other communication nodes can be knocked out leaving millions stranded and without a way of communicating with others. In other instances where skiers, hikers, or travelers get lost in the backcountry, emergency personnel have no way of communicating with those who are lost and can only rely on sweeping large areas of land in a short amount of time to be successful in rescuing those in danger. 

This is where Lifeline comes in. Our project is all about leveraging communication technologies in a novel way to create a new way to establish communication in a short amount of time without the need for prior existing infrastructures such as cell towers, satellites, or wifi access point thereby speeding up natural disaster relief efforts, search and rescue missions, and helping provide real-time metrics for emergency personnel to leverage.

## What it does
Lifeline consists of two main portions. First is a homebrewed mesh network made up of IoT and LoRaWAN nodes built to extend communication between individuals in remote areas. The second is a control center dashboard to allow emergency personnel to view an abundance of key metrics of those at risk such as heart rate, blood oxygen levels, temperature, humidity, compass directions, acceleration, etc. 

On the mesh network side, Lifeline has two main nodes. A control node and a network of secondary nodes. Each of the nodes contains a LoRa antenna capable of communication up to 3.5 km. Additionally, each node consists of a wifi chip capable of acting as both a wifi access point as well as a wifi client. The intention of these nodes is to allow users to connect their cellular devices to the secondary nodes through the local wifi networks created by the wifi access point. They can then send emergency information to response personnel such as their location, their injuries, etc. Additionally, each secondary node contains an array of sensors that can be used both by those in danger in remote communities or by emergency personnel when they venture out into the field so members of the control center team can view their vitals. All of the data collected by the secondary nodes is then sent using the LoRa protocol to other secondary nodes in the area before finally reaching the control node where the data is processed and uploaded to a central server. Our dashboard then fetches the data from this central server and displays it in a beautiful and concise interface for the relevant personnel to read and utilize.

Lifeline has several main use cases: 

1. Establishing communication in remote areas, especially after a natural disaster
2. Search and Rescue missions
3. Providing vitals for emergency response individuals to control center personnel when they are out in the field (such as firefighters)

<img width="1440" alt="Screen Shot 2022-09-18 at 5 06 48 AM" src="https://user-images.githubusercontent.com/34670205/190894552-302fa267-d83e-49eb-8736-6bef85a214a1.png">
<img width="1440" alt="Screen Shot 2022-09-18 at 5 07 00 AM" src="https://user-images.githubusercontent.com/34670205/190894553-37c4d3bf-0f3d-41a9-ac0d-5dcb8936aad9.png">
<img width="1440" alt="Screen Shot 2022-09-18 at 5 07 13 AM" src="https://user-images.githubusercontent.com/34670205/190894554-688fc936-1f20-4ee3-a653-176abec671ce.png">

## How we built it
- The hardware nodes used in Lifeline are all built on the ESP32 microcontroller platform along with a SX1276 LoRa module and IoT wifi module. 
- The firmware is written in C.
- The database is a real-time Google Firebase.
- The dashboard is written in React and styled using Google's Material UI package.

<img width="1262" alt="system diagram" src="https://user-images.githubusercontent.com/34670205/190915506-5ac3a5c0-8c62-4731-a04b-7a1ccde2dadf.png">

![hardware sensors](https://user-images.githubusercontent.com/34670205/190915356-014ed0bc-f35d-4cd2-9d95-445287641c6e.jpeg)

## Challenges we ran into
One of the biggest challenges we ran into in this project was integrating so many different technologies together. Whether it was establishing communication between the individual modules, getting data into the right formats, working with new hardware protocols, or debugging the firmware, Lifeline provided our team with an abundance of challenges that we were proud to tackle.

## Accomplishments that we're proud of
We are most proud of being able to have successfully integrated all of our different technologies and created a working proof of concept for this novel idea. We believe that combing LoRa and wifi in the way can pave the way for a new era of fast communication that doesn't rely on heavy infrastructures such as cell towers or satellites.

## What we learned
We learned a lot about new hardware protocols such as LoRa as well as working with communication technologies and all the challenges that came along with that such as race conditions and security.

![IMG_4141](https://user-images.githubusercontent.com/34670205/190915321-86ccae42-44ae-4a23-b43c-be5810badc6a.JPG)

## What's next for Lifeline
We plan on integrating more sensors in the future and working on new algorithms to process our sensor data to get even more important metrics out of our nodes.
