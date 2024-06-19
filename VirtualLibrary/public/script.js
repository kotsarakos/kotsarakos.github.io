document.addEventListener('DOMContentLoaded', function() {
    const sectionSlider = document.getElementById('sectionSlider');
    const addBookSection = document.getElementById('addBookSection');
    const searchBookSection = document.getElementById('searchBookSection');

    // Initially hide the search section
    searchBookSection.classList.add('hidden');

    // Event listener for section slider input change
    sectionSlider.addEventListener('input', function() {
        const value = parseInt(sectionSlider.value);

        if (value === 0) {
            // Show Add Book section
            addBookSection.classList.remove('hidden');
            searchBookSection.classList.add('hidden');
        } else {
            // Show Search Book section
            addBookSection.classList.add('hidden');
            searchBookSection.classList.remove('hidden');
        }
    });
});

// Add Book Form Submission
document.getElementById('addBookForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const author = document.getElementById('author').value;
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const price = document.getElementById('price').value;

    // Validate price input
    if (isNaN(price)) {
        alert('Please enter a valid number for price.');
        return;
    }

    if (price < 0) {
        alert('Please enter a non-negative number for price.');
        return;
    }

    // Check if price has more than 2 decimal places
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        alert('Please enter a valid price with up to 2 decimal places.');
        return;
    }

    const data = { author, title, genre, price };

    // Send a POST request to add a new book
    fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 409) {
            // Handle case where the book already exists
            return { status: response.status, body: { error: 'The book already exists.' } };
        }
        // Parse the response JSON
        return response.json().then(body => ({ status: response.status, body }));
    })
    .then(({ status, body }) => {
        const responseElement = document.getElementById('addBookResponse');
        if (status === 409 || body.error) {
            // Display error message if book already exists or another error occurs
            responseElement.innerText = body.error;
            fadeOutMessage(responseElement);
        } else {
            // Display success message if book is added successfully
            responseElement.innerText = 'Book added successfully!';
            fadeOutMessage(responseElement);
        }
    })
    .catch(error => {
        // Display error message in case of network or server error
        document.getElementById('addBookResponse').innerText = 'Error adding book.';
        console.error('Error:', error);
    });
});

// Search Book Form Submission
document.getElementById('searchBookForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const keyword = document.getElementById('keyword').value;

    // Send a GET request to search for books by keyword
    fetch(`http://localhost:3000/books/${keyword}`)
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = '';

        if (data.length > 0) {
            // Display each book found in the search results
            data.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.innerHTML = `<strong>${book.title}</strong> by ${book.author} - ${book.genre} - $${book.price}`;
                resultsDiv.appendChild(bookDiv);
            });
        } else {
            // Display message if no books are found
            resultsDiv.innerText = 'No books found.';
        }
    })
    .catch(error => {
        // Display error message in case of network or server error
        document.getElementById('searchResults').innerText = 'Error searching books.';
        console.error('Error:', error);
    });
});

// Function to fade out the message
function fadeOutMessage(element) {
    setTimeout(() => {
        element.style.transition = 'opacity 1s ease-out';
        element.style.opacity = '0';
        setTimeout(() => {
            // Clear the text after the fade-out transition
            element.innerText = '';
            element.style.opacity = '1';
        }, 1000); // Wait for the fade-out transition to complete before clearing the text
    }, 3000); // 3 seconds delay before starting the fade-out
}
