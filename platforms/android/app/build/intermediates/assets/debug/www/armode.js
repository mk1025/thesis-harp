<!DOCTYPE html>
<!--
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->
<html>
    <head>
        <!--
        Customize this policy to fit your own app's needs. For more guidance, see:
            https://github.com/apache/cordova-plugin-whitelist/blob/master/README.md#content-security-policy
        Some notes:
            * gap: is required only on iOS (when using UIWebView) and is needed for JS->native communication
            * https://ssl.gstatic.com is required only on Android and is needed for TalkBack to function properly
            * Disables use of inline scripts in order to mitigate risk of XSS vulnerabilities. To change this:
                * Enable inline JS: add 'unsafe-inline' to default-src
        -->
        <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;"> -->
        <meta name="format-detection" content="telephone=no">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">

        <link rel="stylesheet" type="text/css" href="css/armode.css">
        <link rel="stylesheet" type="text/css" href="css/circle.css">

        <title>HARP Beta</title>
        <script type="text/javascript" src="cordova.js"></script>
        <script type="text/javascript" src="js/armode.js"></script>
    </head>

    <body>
        <!-- SCRIPTS TO LOAD -->
        



        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDBRAJggWx0nDXOAPqJHky_8LIGg6v8cFc&libraries=geometry,places"></script>

        <!-- /////////////// -->

        <!-- GOOGLE MAP -->
        <div id="googlemap" class="googlemap"></div>
        <!-- ////////////// -->

        <!-- ERROR OBLONG -->

        <div id="errOblCont" class="errOblCont">
            <img id="errOblLoadIcon" src="css/img/load3.gif" class="smallLoad">
            <span id="errOblMsg" class="errOblMsg">Finding your location...</span>
        </div>
        <!-- /////////////// -->

        <!-- TRACK ICON -->

        <div id="trackicon" class="trackicon">
            <div class="trackiconMid">
                <div class="trackiconsymbol">&#x25B2</div>
                <div class="trackiconsymbol down">||</div>
            </div>
        </div>

        <div>
            
        </div>

        <!--  -->

        <!-- SETTINGS -->
        <img src="css/img/settingsIcon2.png" class="settingsIcon" onclick="openState('OPENSETTINGS')">

        <div id="settingsCont" class="settingsCont">
            <div class="exitbtn" onclick="exitState('EXITSETTINGS')">X</div>

            <center><div id="settingsUp" class="scrollArrows arrowUp">&#x25B2</div></center>
            <div id="settingsContent" class="settingsContent" onscroll="scrollFunc('settingsContent','settingsUp','settingsDown')">
                <!-- <hr> -->
                    <div class="settingsTitle">DEMO OPTIONS</div>
                <!-- <hr> -->

                <div class="leftSide">Nerd Stats</div>
                <div id="OptNerdStats" onclick="settingsTrigger('NERDSTATS')" class="rightSide">ON</div>



                <div class="leftSide">Fixed Distance</div>
                <div id="OptFixedDistance"class="rightSide" onclick="settingsTrigger('FIXEDDISTANCE')">YES</div>


                <!-- <hr> -->
                    <div class="settingsTitle">GPS</div>
                <!-- <hr> -->

                <div class="leftSide">High Accuracy</div>
                <div id="OptHighAccuracy" onclick="settingsTrigger('HIGHACCURACY')" class="rightSide">OFF</div>

                <!-- <hr> -->
                    <div class="settingsTitle">DISPLAY</div>
                <!-- <hr> -->

                <div class="leftSide">Unit of Distance</div>
                <div id="OptDistanceUnit" class="rightSide UnitOfDistance" onclick="settingsTrigger('DISTANCEUNIT')">Metric (km)</div>

            </div>

            <center><div id="settingsDown" class="scrollArrows arrowDown">&#x25BC</div></center>
        </div>
        <!-- //////////// -->

        <!-- NERD STATS -->
        <div id="nerdStats">
            <br><br><br>

            <span class="nerdStatsSpan">STATUS:</span> 
            <span id="statusdisplay" class="nerdStatsSpan"></span>

            <br><br>
            <span class="nerdStatsSpan">Longitude:</span> 
            <span id="statusLongitude" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Latitude:</span> 
            <span id="statusLatitude" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Altitude:</span> 
            <span id="statusAltitude" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Accuracy:</span> 
            <span id="statusAccuracy" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Altitude Accuracy:</span> <span id="statusAltitudeAccuracy" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Heading:</span> <span id="statusHeading" class="nerdStatsSpan"></span><br>
            <span class="nerdStatsSpan">Speed:</span> <span id="statusSpeed" class="nerdStatsSpan"></span>

            <br>
            <span class="nerdStatsSpan">Timestamp:</span> <span id="statusTimestamp" class="nerdStatsSpan"></span>

            <br><br>


            <span class="nerdStatsSpan">Beta: <span id="tiltFB" class="nerdStatsSpan"></span><br>
            <span class="nerdStatsSpan">Gamma: <span id="tiltLR" class="nerdStatsSpan"></span><br>
            <span class="nerdStatsSpan">Alpha: <span id="statusAlphaValue" class="nerdStatsSpan"></span><br>
            <span class="nerdStatsSpan">Direction: <span id="statusDirection" class="nerdStatsSpan"></span><br>
            <span class="nerdStatsSpan">Track ID: <span id="statusTrackID" class="nerdStatsSpan"></span><br>

        </div> 

        <!-- COMPASS -->
        <div id="compassCont" class="compassCont">
            <div class="compassCont2">
                <div class="compassLetters North">N</div>
                <div class="compassLetters West">W</div>
                <div class="compassLetters East">E</div>
                <div class="compassLetters South">S</div>
            </div> 
        </div>
        <!-- ////////  -->

        <!-- CHECK HOTEL -->
        <div id="checkhotelCont" class="checkhotelCont">

            <div class="exitbtn" onclick="exitState('EXITHOTEL')">X</div>

            <div id="checkhotelContent" class="checkhotelContent">

                <div id="checkhotelArrowUp" class="scrollArrows hotelcheck arrowUp">&#x25B2</div>
                
                <div id="checkhotelContentContent" class="checkhotelContentContent" onscroll="scrollFunc('checkhotelContentContent','checkhotelArrowUp','checkhotelArrowDown')">

                    <!-- CHECK HOTEL AREA -->

                    <div id="checkhotelTitle" class="cardTitle">???</div>
                    <div id="checkhotelAddress"  class="cardAddress checkhotelAddress">???</div>
                    <div id="checkhotelDistance" class="checkhotelDistance">???</div>
                    <button id="checkhotelTrack" class="trackbtn">TRACK</button>

                    <div id="checkhotelCircleContainer" class="checkhotelCircleContainer">
                        <div id="checkhotelcardCircle" class="c100 p50 center slateblue">
                            <span id="percentscore" onclick="setInnerHTMLDual(this.id,'3/5','50%');"></span>
                            <div class="bar"></div>
                            <div class="fill"></div>
                        </div>
                        <!-- <div class="rawscore">3/5</div> -->
                    </div>
                    <b><span id="checkhotelUsers">0</span></b> people have reviewed this place.
                    <div class="settingsTitle">REVIEWS</div>
                    <div id="reviewArea" class="reviewsArea">
                        <!-- <div class="reviewCard">
                            <center><span class="reviewrating"></span></center>
                            <i><p>&ldquo;
                                <span></span>
                            &rdquo;</p></i>
                            -&nbsp;<b><span></span></b>,&nbsp;<span></span>
                        </div> -->
                    </div>

                    <!-- //////// -->
                </div>

                <div id="checkhotelArrowDown" class="scrollArrows hotelcheck arrowDown">&#x25BC</div>
            </div>
        </div>
        <!-- ///////////// -->
        <!-- ///////////// -->

        <canvas id="cameradisplay" class="cameradisplay"></canvas>

        <div id="dimContainer" class="dimContainer">
            <!-- <center> -->

                <!-- <div id="trueNorth" class="trueNorth">- N -</div> -->
                <span id="cardsArea" class="cardArea">
                    <!-- SAMPLE CARD  -->

                    <!-- <div id="sample" class="cardContainer">
                        <div id="cardTitle" class="cardTitle">
                            Hotel XYZ adasd asdasdasdasd asd asdasdas das asdas d
                        </div>

                        <div class="cardAddress"><marquee>Brgy 87, San Jose, Tacloban City asda asdasd ad ad asd asda sdas dasd asd adassd asdasd asdas dasd asdasdasd asd adasdasdas da dasdas</marquee></div>

                        <div id="cardCircleContainer" class="cardCircleContainer">
                            <div id="cardCircle" class="c100 p50 big center slateblue">
                                <span id="cardPercentScore">50%</span>
                                <div class="bar"></div>
                                <div class="fill"></div>
                            </div>
                        </div>
                        <div class="cardUserTotal">out of <b>149</b> users liked this place</div>
                        <div class="cardDistance">0.51 km</div>
                    </div> -->

                    <!-- //////////  -->
                </span>
            <!-- </center> -->
        </div>
    </body>
</html>
