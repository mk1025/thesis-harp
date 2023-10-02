# HARP

## Story & Description

This was my thesis project way back in college. I was very new to using HTML, CSS, JavaScript, and especially Node back in early 2019.

This project was my first introduction to using Node.js, Web APIs, JSON, and (the now deprecated) WebSQL Database.

HARP is an app that locates hotels for you. It uses your device's geolocation and finds the nearest hotels by computing the distance between the user and the hotel.

Sounds simple but it became a gimmick by making it a fake AR app where it uses the phone's camera and gives you a fake AR experience like moving or floating boxes that points to the hotel of that direction.

It was fun and I learned a lot.

Luckily, I was able to find the source code hidden in one my old drives from my old laptop. I made a few very minor changes and the source code still works.

Do mind that this project was made in mid 2019 and my experience in Web Development was very limited.

Also

> [!WARNING]
> VERY SMELLY CODE AND OUTDATED.

## Requirements

> [!IMPORTANT]
> You will need the following:

- [Node.js](https://nodejs.org/en/download/)
- [Gradle](https://gradle.org/install/)
- [Java Development Kit](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
- [Apache Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/installation.html)

or you can follow the [guide here](https://cordova.apache.org/docs/en/11.x/guide/platforms/android/index.html).

## Installation

1. Download the GitHub repository using a terminal.

    ```bash
    git clone https://github.com/mk1025/thesis-harp.git
    ```

2. Navigate to your project folder.

3. Install the dependencies.

    ```bash
    npm install
    ```

4. Run the app. You can look into the [guide](https://cordova.apache.org/docs/en/12.x/guide/platforms/android/index.html) on how to do it.

    On the browser:

    ```bash
    cordova run
    ```

    On your android device:

    ```bash
    cordova run android
    ```

## Usage

This is a beginner-made app so expect a lot of bugs and the UI is not perfect.

### Main Menu

Upon running the app, you will be greeted with the main menu. There are three modes:

| Mode | Description |
| --- | --- |
| AR Mode | Uses the fake AR feature to "locate" the hotels. The camera and device orientation sensor API will be used to operate in this mode and heavy performance is expected. |
| Standard or Normal Mode | No device camera and device orientation API. Just the geolocation API and Google Maps API will be used. Heavy performance is expected.  |
| Offline Mode | Similar to Standard Mode but without using the internet, camera, device orientation, and Google Maps API. Since the hotel data is stored locally, a feature from previous modes, the online fetching of the data is skipped. This mode will still use your GPS to get your current location.

> [!NOTE]
> There will be a warning popup before using any of the modes.

Select the mode you want to use and have fun with it.

### Settings

| Setting | Description | Options |
| --- | --- | --- |
| Distance Unit | The system of measurement to be used to display the distance. | <ul><li>Metric (km)</li><li>Imperial (yd, mi)</li></ul> |
| Search Radius | The range of the hotel search based on your current location. | <ul><li>500 m / 546 yd</li><li>1 km / 1,094 yd</li><li>2 km / 1.24 mi</li></ul> |
| Hotel Rating Display | The rating scale to be used to display the overall review score of a hotel. | <ul><li>Percentage (%)</li><li>Likert or Satisfaction Scale (1.0-5.0)</li></ul> |
| High Accuracy | If your device can support it, using 'High Accuracy' gives you more accurate results of retrieving geolocation. It may drain your battery more. | <ul><li>On</li><li>Off</li></ul> |
| Nerd Stats (AR Mode only) | Shows the following data of the device: <ul><li>Current latitude and longitude</li><li>Current GPS accuracy</li><li>Current altitude and its accuracy</li><li>Speed</li><li>Timestamp (raw)</li><li>Device Orientation (Beta, Gamma, Alpha)</li></ul> | <ul><li>On</li><li>Off</li></ul> |
| Fixed Distance (AR Mode only) | Let's the floating objects be fixed at a certain distance regardless how far or close they are to the user. | <ul><li>On</li><li>Off</li></ul> | <ul><li>On</li><li>Off</li></ul> |
| Travel Mode | This is an option for the Google Maps API used in the app. When you select a hotel to track, the navigation route will adjust based on your travel mode option.  | <ul><li>Walking</li><li>Driving</li><li>Bicycling</li><li>Transit</li></ul> |

## Legacy

Even though I want the source code to be as is, you can fork it and make changes to it. However, if you want to experiment or do something nice with the project, go for it.

If there are bugs that prevent the app from running, please let me know.

I will also be working on a new version of this project using modern web technologies or web dev tools.

## Credits

Thanks to my thesis members for their help. I couldn't have done it without them. The accumulated pressure of the semester was too much for me to handle and I hadn't been faithful to the project but they were very patient with me and supported me throughout the process. I thought about giving up because of the scope of the project and the knowledge we had at the time using the tools was limited but I am glad I didn't because I pursued to invest in learning new things.
