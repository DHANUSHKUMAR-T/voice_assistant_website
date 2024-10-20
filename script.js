const startBtn = document.getElementById('start-btn');
const output = document.getElementById('output');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;

let timeout; // Variable to store the timeout

// Start Listening to Commands
startBtn.addEventListener('click', () => {
    output.innerHTML = "I am listening..."; // Show listening message
    recognition.start();

    // Clear any existing timeout
    clearTimeout(timeout);

    // Set a timeout to reset the message if no speech is detected
    timeout = setTimeout(() => {
        output.innerHTML = "Say something..."; // Reset output to initial message
        recognition.stop(); // Stop recognition if no speech is detected
    }, 5000); // Set the timeout period (e.g., 5000 milliseconds = 5 seconds)
});

// Voice recognition result handler
recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    output.innerHTML = "You said: " + command;
    clearTimeout(timeout); // Clear the timeout if speech is detected
    processCommand(command);
    speakOutput(command); // Use computer voice
};

// Speech ends
recognition.onspeechend = function() {
    output.innerHTML = "Say something..."; // Reset output to initial message
    clearTimeout(timeout); // Clear the timeout
    recognition.stop();
};

// Process Command Function
function processCommand(command) {
    if (command.includes("play")) {
        const song = command.replace("play", "").trim();
        playSongOnYouTube(song);
    } else if (command.includes("time")) {
        tellTime();
    } else if (command.includes("date")) {
        handleDateCommand(command);
    } else if (command.includes("joke")) {
        tellJoke();
    } else if (command.includes("weather")) {
        fetchWeather();
    } else if (command.includes("fun fact")) {
        fetchFunFact();
    } else if (command.includes("news")) {
        fetchNewsHeadlines();
    } else if (command.includes("capture")) {
        captureImage();
    } else if (command.includes("search")) {
        searchGoogle(command);
    } else {
        output.innerHTML = "Sorry, I didn't understand the command.";
    }
}

// Text-to-Speech (Specific Female Voice)
function speakOutput(text) {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(text);

    // Load the voices
    window.speechSynthesis.onvoiceschanged = function() {
        const voices = synth.getVoices(); // Get the available voices
        const femaleVoices = voices.filter(voice => voice.name.toLowerCase().includes('female')); // Find female voices
        const selectedVoice = femaleVoices.length > 0 ? femaleVoices[0] : voices[0]; // Use first female voice or default to the first voice

        utterThis.voice = selectedVoice; // Set the selected female voice to utterThis
        synth.speak(utterThis); // Speak the text
    };
}

// Play song on YouTube
function playSongOnYouTube(song) {
    window.open(`https://www.youtube.com/results?search_query=${song}`, '_blank');
    output.innerHTML = `Playing ${song} on YouTube`;
}

// Tell current time
function tellTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    output.innerHTML = "The current time is " + time;
    speakOutput("The current time is " + time);
}

// Handle Date Command
function handleDateCommand(command) {
    const today = new Date();
    if (command.includes("today")) {
        output.innerHTML = "Today's date is " + today.toDateString();
    } else if (command.includes("tomorrow")) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        output.innerHTML = "Tomorrow's date will be " + tomorrow.toDateString();
    } else if (command.includes("yesterday")) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        output.innerHTML = "Yesterday's date was " + yesterday.toDateString();
    }
}

// Tell a Joke
function tellJoke() {
    fetch('https://official-joke-api.appspot.com/random_joke')
        .then(response => response.json())
        .then(data => {
            output.innerHTML = `${data.setup} - ${data.punchline}`;
            speakOutput(`${data.setup} - ${data.punchline}`);
        })
        .catch(error => {
            console.error("Error fetching joke: ", error);
        });
}

// Fetch Weather
function fetchWeather() {
    const apiKey = 'your-api-key'; // Use OpenWeather API or similar
    const city = 'London'; // You can make this dynamic
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const temp = (data.main.temp - 273.15).toFixed(2); // Convert from Kelvin to Celsius
            const weatherDesc = data.weather[0].description;
            const weatherMessage = `The current weather in ${city} is ${temp}°C with ${weatherDesc}.`;
            output.innerHTML = weatherMessage;
            speakOutput(weatherMessage);
        })
        .catch(error => {
            console.error("Error fetching weather: ", error);
        });
}

// Search Google
function searchGoogle(command) {
    const query = command.replace("search", "").trim(); // Remove the word "search"
    const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleSearchURL, '_blank');
}

// Capture Image from Webcam
function captureImage() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.style.display = "block";
                video.srcObject = stream;
                video.play();
                
                setTimeout(() => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imgData = canvas.toDataURL('image/png');
                    output.innerHTML = `<img src="${imgData}" alt="Captured Image"/>`;
                    speakOutput("Image captured");

                    // Stop the video stream
                    stream.getTracks().forEach(track => track.stop());
                    video.style.display = "none";
                }, 3000);
            })
            .catch(error => {
                console.error("Error accessing webcam: ", error);
            });
    }
}
