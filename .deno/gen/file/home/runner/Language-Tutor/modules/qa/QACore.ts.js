export function SelectWords(words, numberOfWords) {
    if (numberOfWords >= words.length) {
        // if the number of words to select is greater than or equal to the number of words in the list,
        // return all the words
        return words.slice();
    } else {
        // if the number of words to select is less than the number of words in the list,
        // select the words randomly
        const selectedWords = [];
        const wordsCopy = words.slice(); // make a copy of the words array
        while(selectedWords.length < numberOfWords){
            // randomly select a word from the array
            const index = Math.floor(Math.random() * wordsCopy.length);
            selectedWords.push(wordsCopy[index]);
            wordsCopy.splice(index, 1); // remove the selected word from the array to avoid duplicates
        }
        return selectedWords;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvTGFuZ3VhZ2UtVHV0b3IvbW9kdWxlcy9xYS9RQUNvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdFdvcmRzKHdvcmRzOiBzdHJpbmdbXSwgbnVtYmVyT2ZXb3JkczogbnVtYmVyKTogc3RyaW5nW10ge1xuICBpZiAobnVtYmVyT2ZXb3JkcyA+PSB3b3Jkcy5sZW5ndGgpIHtcbiAgICAvLyBpZiB0aGUgbnVtYmVyIG9mIHdvcmRzIHRvIHNlbGVjdCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIG51bWJlciBvZiB3b3JkcyBpbiB0aGUgbGlzdCxcbiAgICAvLyByZXR1cm4gYWxsIHRoZSB3b3Jkc1xuICAgIHJldHVybiB3b3Jkcy5zbGljZSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGlmIHRoZSBudW1iZXIgb2Ygd29yZHMgdG8gc2VsZWN0IGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIHdvcmRzIGluIHRoZSBsaXN0LFxuICAgIC8vIHNlbGVjdCB0aGUgd29yZHMgcmFuZG9tbHlcbiAgICBjb25zdCBzZWxlY3RlZFdvcmRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHdvcmRzQ29weSA9IHdvcmRzLnNsaWNlKCk7IC8vIG1ha2UgYSBjb3B5IG9mIHRoZSB3b3JkcyBhcnJheVxuICAgIHdoaWxlIChzZWxlY3RlZFdvcmRzLmxlbmd0aCA8IG51bWJlck9mV29yZHMpIHtcbiAgICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBhIHdvcmQgZnJvbSB0aGUgYXJyYXlcbiAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd29yZHNDb3B5Lmxlbmd0aCk7XG4gICAgICBzZWxlY3RlZFdvcmRzLnB1c2god29yZHNDb3B5W2luZGV4XSk7XG4gICAgICB3b3Jkc0NvcHkuc3BsaWNlKGluZGV4LCAxKTsgLy8gcmVtb3ZlIHRoZSBzZWxlY3RlZCB3b3JkIGZyb20gdGhlIGFycmF5IHRvIGF2b2lkIGR1cGxpY2F0ZXNcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGVkV29yZHM7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsWUFBWSxLQUFlLEVBQUUsYUFBcUIsRUFBWTtJQUM1RSxJQUFJLGlCQUFpQixNQUFNLE1BQU0sRUFBRTtRQUNqQyxnR0FBZ0c7UUFDaEcsdUJBQXVCO1FBQ3ZCLE9BQU8sTUFBTSxLQUFLO0lBQ3BCLE9BQU87UUFDTCxpRkFBaUY7UUFDakYsNEJBQTRCO1FBQzVCLE1BQU0sZ0JBQTBCLEVBQUU7UUFDbEMsTUFBTSxZQUFZLE1BQU0sS0FBSyxJQUFJLGlDQUFpQztRQUNsRSxNQUFPLGNBQWMsTUFBTSxHQUFHLGNBQWU7WUFDM0Msd0NBQXdDO1lBQ3hDLE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQyxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU07WUFDekQsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07WUFDbkMsVUFBVSxNQUFNLENBQUMsT0FBTyxJQUFJLDhEQUE4RDtRQUM1RjtRQUNBLE9BQU87SUFDVCxDQUFDO0FBQ0gsQ0FBQyJ9