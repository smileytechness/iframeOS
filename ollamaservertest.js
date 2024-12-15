// Create and style the output box dynamically
const outputBox = document.createElement('div');
outputBox.id = 'outputBox';
outputBox.style.position = 'fixed';
outputBox.style.top = '20px';
outputBox.style.right = '20px';
outputBox.style.width = '300px';
outputBox.style.height = '200px';
outputBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
outputBox.style.border = '1px solid #ccc';
outputBox.style.borderRadius = '5px';
outputBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
outputBox.style.padding = '10px';
outputBox.style.overflowY = 'auto'; // Allow scrolling if content overflows
outputBox.style.zIndex = '1000'; // Ensure it appears above other elements
outputBox.innerText = 'Streaming Output:';
document.body.appendChild(outputBox); // Append the output box to the body

// Define the server URL
const url = "http://172.16.101.133:11434/v1/chat/completions"; // Ollama server endpoint

// Set up the headers, including your API key if required
const headers = {
    "Content-Type": "application/json",
    // "Authorization": "Bearer YOUR_API_KEY"  // Uncomment and replace with your API key if needed
};

// Define the payload for the request with default settings
const data = {
    model: "qwen2.5", // Specify the qwen2.5 model
    messages: [
        { role: "user", content: "Use 10 words to describe good weather." } // Example prompt
    ],
    max_tokens: 150, // Default maximum number of tokens to generate
    temperature: 0.7, // Default randomness
    top_p: 1.0, // Default nucleus sampling parameter
    frequency_penalty: 0.0, // Default frequency penalty
    presence_penalty: 0.0, // Default presence penalty
    stop: null, // Default stop condition (none)
    user: null, // Default user identifier (none)
    logit_bias: null, // Default logit bias (none)
    stream: true, // Enable streaming responses
    echo: false, // Default to not echo the prompt
    best_of: 1, // Default number of completions to generate
    logprobs: null, // Default log probabilities (none)
    return_prompt: false, // Default to not return the original prompt
    n: 1, // Default number of completions to generate
    timeout: 5000, // Default timeout (5 seconds)
    context: null, // Default context (none)
    model_version: null, // Default model version (none)
    temperature_decay: null, // Default temperature decay (none)
    repetition_penalty: 1.0, // Default repetition penalty
    return_metadata: false // Default to not return additional metadata
};

// Make the API call
fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
})
.then(response => {
    // Check if the response is okay
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = '';

    // Function to read the stream
    const readStream = () => {
        reader.read().then(({ done, value }) => {
            if (done) {
                console.log("Stream finished.");
                return;
            }
            // Decode the chunk and log it
            result += decoder.decode(value, { stream: true });
            console.log("Streaming Response:", result);
            
            // Extract the content from the result
            const contentMatches = result.match(/"content":"(.*?)"/g);
            if (contentMatches) {
                // Extract and join the matched content
                const extractedContent = contentMatches.map(match => match.replace(/"content":"(.*?)"/, '$1')).join(' ');

                // Handle formatting
                let formattedContent = extractedContent
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                    .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
                    .replace(/\n\n/g, '<br><br>'); // New paragraph

                outputBox.innerHTML = formattedContent; // Update the text box with the formatted content
            }
            
            readStream(); // Continue reading
        }).catch(error => {
            console.error("Error reading stream:", error);
        });
    };

    readStream(); // Start reading the stream
})
.catch(error => {
    console.error("Error:", error);
});