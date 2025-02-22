let words = "";
const urlParams = new URLSearchParams(window.location.search);
const exercise = urlParams.get('exercise');

if (exercise) {
    document.getElementById("test_text").innerText = decodeURIComponent(exercise);
    words = decodeURIComponent(exercise).split(/\s+/); // Split the exercise into words for typing
} else {
    document.getElementById("test_text").innerText = "Loading...";
    words = []; // Initialize words as an empty array if no exercise is provided
}

let currentChunkIndex = 0; // Index of the current chunk being displayed
let currentIndex = 0; // Index of the current word being typed
let correctWordsTyped = 0;
let wrongWords = 0;
let totalTypedWords = 0; // New variable to count all typed words
let timer = null;
let timeRemaining = 0; // Will be set based on the timer selection
let testCompleted = false;
let correctCharsTyped = 0; // New variable to count characters of correct words
let wrongCharsTyped = 0; // New variable to count characters of wrong words
let originalWords = []; // Store the original words for comparison
let allTypedWords = []; // Array to store all sets of typed words
let startTime = null; // New variable to track the start time
let lastDisplayedWords = ""; // Store the last displayed words
let backspaceCount = 0; // New variable to count backspaces
let typedChunks = []; // Array to store typed chunks
let timeTaken = 0;

// Calculate chunk size based on total words
const totalWords = words.length;
const chunkSize = Math.ceil(totalWords / 10); // Size of each chunk

const updateDisplayTime = () => {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, "0");
    const seconds = (timeRemaining % 60).toString().padStart(2, "0");
    document.getElementById("time_remaining").textContent = `Time Remaining: ${minutes}:${seconds}`;
};

// Disable right-click and specific keyboard shortcuts
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Disable specific keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Disable Ctrl key
    if (event.ctrlKey) {
        event.preventDefault();
    }

    // Disable Ctrl + U
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
    }
    // Disable Ctrl + P
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
    }
    // Disable Ctrl + C
    if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
    }

    // Disable F12
    if (event.key === 'F12') {
        event.preventDefault();
    }
});

window.onload = function() {
    resetTest(); // Call resetTest to initialize values
};

const resetTest = () => {
    clearInterval(timer);
    timer = null;
    timeRemaining = parseInt(document.getElementById("timer").value); // Set time based on user selection
    currentIndex = 0; // Reset current index
    correctWordsTyped = 0;
    wrongWords = 0;
    totalTypedWords = 0; // Reset total typed words
    correctCharsTyped = 0; // Reset correct characters count
    wrongCharsTyped = 0; // Reset wrong characters count
    document.getElementById("typed_text").value = ""; // Clear the input on reset
    document.getElementById("results").innerHTML = "";
    document.getElementById("test_text").innerHTML = ""; // Clear previous text
    updateDisplayTime();
    updateLiveResults(); // Reset live results display
    displayNextWords(); // Display the first set of words
};

const displayNextWords = () => {
    const nextWords = words.slice(currentIndex, currentIndex + chunkSize).join(" "); // Use chunkSize instead of 40
    originalWords.push(nextWords); // Store the original words as a chunk
    lastDisplayedWords = nextWords; // Update the last displayed words
    document.getElementById("test_text").innerHTML = `<div class="word-set">${nextWords}</div>`; // Replace previous words
    updateCurrentChunkDisplay(); // Update the chunk display when new words are shown
};

const startTimer = () => {
    if (!timer) {
        startTime = Date.now(); // Record the start time
        timer = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplayTime();
            } else {
                clearInterval(timer);
                timer = null;
                testCompleted = true;
                handleTestCompletion(); // Handle test completion
            }
        }, 1000);
    }
};

const handleTestCompletion = () => {
    const typedText = document.getElementById("typed_text").value.trim();
    const typedWords = typedText.split(" ").filter(word => word.length > 0); // Split and filter out empty strings
    const currentWords = words.slice(currentIndex, currentIndex + chunkSize); // Get the current chunk of words

    // Compare typed words with current words
    let correctCount = 0;
    let wrongCount = 0;

    // Count correct and wrong words
    for (let i = 0; i < typedWords.length; i++) {
        if (i < currentWords.length && typedWords[i] === currentWords[i]) {
            correctCount++;
            correctCharsTyped += typedWords[i].length; // Count characters of the correct word excluding spaces
        } else {
            wrongCount++;
            wrongCharsTyped += typedWords[i].length; // Count characters of the wrong word excluding spaces
        }
    }

    // Update counts
    correctWordsTyped += correctCount;
    wrongWords += wrongCount;
    totalTypedWords += typedWords.length; // Increment total typed words by the number of typed words

    showResults(); // Show results when time is up
};

const showResults = () => {		
    const totalTypedWords = correctWordsTyped + wrongWords; // Calculate total typed words
    const accuracy = totalTypedWords > 0 ? ((correctWordsTyped / totalTypedWords) * 100).toFixed(2) : 0;

    // Calculate typing speed
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
    const typingSpeed = (((correctCharsTyped / 5) / (elapsedTime / 60))).toFixed(2); // Words per minute

    // Prepare data to send to results page
    const originalWordsString = JSON.stringify(originalWords);
    const typedWordsString = JSON.stringify(allTypedWords); // Include all typed words

    // Construct the URL for the results page
    const resultsUrl = `results.html?exercise=${encodeURIComponent(words.join(" "))}&originalWords=${encodeURIComponent(originalWordsString)}&typedWords=${encodeURIComponent(typedWordsString)}&correctCount=${correctWordsTyped}&wrongCount=${wrongWords}&correctChars=${correctCharsTyped}&wrongChars=${wrongCharsTyped}&typingSpeed=${typingSpeed}&accuracy=${accuracy}&backspaceCount=${backspaceCount}&elapsedTime=${elapsedTime}`;

    // Redirect to results page with parameters
    window.location.href = resultsUrl;
};

const updateLiveResults = () => {
    document.getElementById("live_results").innerHTML = `<br>
       <b> <div style="Color:green"><table style="display:none" width="100%">
       <tr><th>Correct Words:<b style="Color:green;text-align:center"> ${correctWordsTyped}</b></th>
       <th><b>Incorrect Words: <b style="Color:red;text-align:center">${wrongWords}</b></b></th>
       <th><b>Total Typed Words: ${correctWordsTyped + wrongWords}</b></th></tr>
	 </table></div>
    `;
};

// Ensure typedChunks is updated when the user types
document.getElementById("typed_text").addEventListener("input", (e) => {
    const typedText = e.target.value.trim();
    const currentWords = words.slice(currentIndex, currentIndex + chunkSize); // Get the current chunk of words

    // Start the timer when the user starts typing
    if (!timer) {
        startTimer();
    }

    // Update live results
    updateLiveResults();
    
    // Update the highlighted word based on the typed text
  const highlightEnabled = document.getElementById("highlight_toggle").checked;

if (highlightEnabled) {
    const typedWords = typedText.trim().split(/\s+/); // Trim and split typed text into words
    const referenceWords = currentWords; // Assuming currentWords contains the correct text words

    let highlightedText = referenceWords.map((word, index) => {
        if (index+1 === typedWords.length) {
            return `<span class="highlight">${word}</span>`; // Highlight the expected next word
        }
        return word;
    }).join(" ");

    document.getElementById("test_text").innerHTML = `<div class="word-set">${highlightedText}</div>`;
} else {
    document.getElementById("test_text").innerHTML = `<div class="word-set">${currentWords.join(" ")}</div>`;
}

// Store the entire typed text for this chunk
if (typedText) {
    const chunkIndex = Math.floor(currentIndex / chunkSize);
    typedChunks[chunkIndex] = typedText;
}

});

// Modify the keydown event listener to navigate through typed chunks
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        if (currentChunkIndex > 0) {
            currentChunkIndex--;
            updateCurrentChunkDisplay(); // Update the display after changing the index
            currentIndex = currentChunkIndex * chunkSize; // Update currentIndex based on chunk index
            displayNextWords(); // Display the original words for the current chunk
            
            // Display the typed text for the current chunk
            document.getElementById("typed_text").value = typedChunks[currentChunkIndex] || ""; // Show typed text for the current chunk
            updateLiveResults();
        }
    } else if (event.key === 'ArrowDown') {
        if (currentChunkIndex < typedChunks.length - 1) {
            currentChunkIndex++;
            updateCurrentChunkDisplay(); // Update the display after changing the index
            currentIndex = currentChunkIndex * chunkSize; // Update currentIndex based on chunk index
            displayNextWords(); // Display the original words for the current chunk
            
            // Display the typed text for the current chunk
            document.getElementById("typed_text").value = typedChunks[currentChunkIndex] || ""; // Show typed text for the current chunk
            updateLiveResults();
        }
    }
});

// Function to update the current chunk display
function updateCurrentChunkDisplay() {
    const totalChunks = Math.ceil(words.length / chunkSize); // Assuming chunkSize words per chunk
    document.getElementById('current_chunk_number').innerText = `Chunk ${currentChunkIndex + 1}`; // Show current chunk number
}

// Event listeners for typing input
document.getElementById("typed_text").addEventListener("input", (e) => {
    const typedText = e.target.value.trim();
    const currentWords = words.slice(currentIndex, currentIndex + chunkSize); // Get the current chunk of words

    // Start the timer when the user starts typing
    if (!timer) {
        startTimer();
    }

    // Update live results
    updateLiveResults();

    // Store the entire typed text for this chunk
    if (typedText) {
        const chunkIndex = Math.floor(currentIndex / chunkSize); // Calculate the chunk index based on the current index
        allTypedWords[chunkIndex] = typedText; // Store typed text for the current chunk
    }
});

// Handle backspace count
document.getElementById("typed_text").addEventListener("keydown", (e) => {
    const allowBackspace = document.getElementById("backspace_toggle").checked; // Check if backspace is allowed
    const typedText = document.getElementById("typed_text").value; // Get the current input value

    if (e.key === "Backspace") {
        if (!allowBackspace) {
            // If backspace is not allowed, check the last character
            if (typedText.length > 0 && typedText[typedText.length - 1] === ' ') {
                e.preventDefault(); // Prevent backspace if the last character is a space
            } else {
                backspaceCount++; // Increment backspace count if allowed
            }
        } else {
            backspaceCount++; // Increment backspace count if allowed
        }
    }
});

// Handle Enter key functionality
document.getElementById("typed_text").addEventListener("keydown", (e) => {
    const typedText = document.getElementById("typed_text").value; // Get the current input value
    const typedWords = typedText.trim().split(" ").filter(word => word.length > 0); // Filter out empty strings
    const currentWords = words.slice(currentIndex, currentIndex + chunkSize); // Get the current chunk of words

    // Allow backspace functionality only if the last character is not a space
    if (e.key === "Backspace") {
        if (typedText.length > 0) {
            if (typedText[typedText.length - 1] !== ' ') {
                return; // Allow backspace
            }
        }
    }

    // Check if the pressed key is the up or down arrow key
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        return; // Exit the function early
    }

    // Handle Enter key functionality
    if (e.key === "Enter") {
        // Check if at least 90% of the chunk words are typed
        const requiredWords = Math.ceil(currentWords.length * 0.9); // 90% of the current chunk
        if (typedWords.length >= requiredWords) {
            // Compare typed words with current words
            let correctCount = 0;
            let wrongCount = 0;

            // Count correct and wrong words
            for (let i = 0; i < typedWords.length; i++) {
                if (i < currentWords.length && typedWords[i] === currentWords[i]) {
                    correctCount++;
                    correctCharsTyped += typedWords[i].length; // Count characters of the correct word excluding spaces
                } else {
                    wrongCount++;
                    wrongCharsTyped += typedWords[i].length; // Count characters of the wrong word excluding spaces
                }
            }

            currentChunkIndex++;
            updateLiveResults();  

            // Update counts
            correctWordsTyped += correctCount;
            wrongWords += wrongCount;
            totalTypedWords++; // Increment total typed words by 1

            // Move to the next set of words
            currentIndex += chunkSize; // Increment by chunkSize to move to the next set of words
            document.getElementById("typed_text").value = ""; // Clear the input field

            // Display the next set of words or show results if no more words
            if (currentIndex < words.length) {
                displayNextWords(); // Display the next set of words
            } else {
                // If no more words, show results
                showResults();
            }

            // Update live results
            updateLiveResults();
        } else {
            alert("Please type at least 90% of the words in the chunk before pressing Enter.");
        }
    }
});

// Event listener for the submit button
document.getElementById("submit_button").addEventListener("click", () => {
    if (!testCompleted) { // Check if the test is not already completed
        // Handle the current chunk before showing results
        const typedText = document.getElementById("typed_text").value.trim();
        const typedWords = typedText.split(" ").filter(word => word.length > 0); // Split and filter out empty strings
        const currentWords = words.slice(currentIndex, currentIndex + chunkSize); // Get the current chunk of words

        // Compare typed words with current words
        let correctCount = 0;
        let wrongCount = 0;

        // Count correct and wrong words
        for (let i = 0; i < typedWords.length; i++) {
            if (i < currentWords.length && typedWords[i] === currentWords[i]) {
                correctCount++;
                correctCharsTyped += typedWords[i].replace(/\s/g, '').length; // Count characters of the correct word excluding spaces
            } else {
                wrongCount++;
                wrongCharsTyped += typedWords[i].replace(/\s/g, '').length; // Count characters of the wrong word excluding spaces
            }	
        }

        // Update counts
        correctWordsTyped += correctCount;
        wrongWords += wrongCount;
        totalTypedWords++; // Increment total typed words by 1

        showResults(); // Call the function to show results
    }
});
// Add this code to handle the Alt + H shortcut
document.addEventListener('keydown', function(event) {
    if (event.altKey && event.key === 'h') {
        const checkboxContainer = document.getElementById("checkbox_container");
        // Toggle the display of the checkbox container
        if (checkboxContainer.style.display === "none") {
            checkboxContainer.style.display = "block"; // Show the checkboxes
        } else {
            checkboxContainer.style.display = "none"; // Hide the checkboxes
        }
    }
});
document.getElementById("char_highlight_toggle").addEventListener("change", () => {
    const highlightEnabled = document.getElementById("char_highlight_toggle").checked;
    updateHighlightedText(highlightEnabled);
});


// Add this code to ensure the restart button works
document.getElementById("restart_button").addEventListener("click", resetTest);
// Reset the test on page load
resetTest();