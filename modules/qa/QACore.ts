export function SelectWords(words: string[], numberOfWords: number): string[] {
  if (numberOfWords >= words.length) {
    // if the number of words to select is greater than or equal to the number of words in the list,
    // return all the words
    return words.slice();
  } else {
    // if the number of words to select is less than the number of words in the list,
    // select the words randomly
    const selectedWords: string[] = [];
    const wordsCopy = words.slice(); // make a copy of the words array
    while (selectedWords.length < numberOfWords) {
      // randomly select a word from the array
      const index = Math.floor(Math.random() * wordsCopy.length);
      selectedWords.push(wordsCopy[index]);
      wordsCopy.splice(index, 1); // remove the selected word from the array to avoid duplicates
    }
    return selectedWords;
  }
}
