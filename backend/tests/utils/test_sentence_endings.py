import unittest

from app.utils import find_sentence_endings


class TestFindSentenceEndings(unittest.TestCase):
    def test_basic_sentences(self):
        text = "This is a sentence. This is another one!"
        expected = [20, 40, len(text)]  # Sentence endings at ".", "!", and the last index
        self.assertEqual(find_sentence_endings(text), expected)

    def test_text_without_punctuation(self):
        text = "This is a sentence without punctuation"
        expected = [len(text)]  # Only the last index is expected
        self.assertEqual(find_sentence_endings(text), expected)

    def test_multiple_punctuation(self):
        text = "Is this working? Yes! It seems so."
        expected = [17, 22, 34, len(text)]  # Endings after "?", "!", ".", and the last index
        self.assertEqual(find_sentence_endings(text), expected)

    def test_trailing_whitespace(self):
        text = "Trailing whitespace should be ignored.   "
        expected = [39, len(text)]  # End at the period and the final index
        self.assertEqual(find_sentence_endings(text), expected)

    def test_punctuation_in_middle_of_text(self):
        text = "Sentence. Followed by an abbreviation e.g. and another sentence."
        expected = [10, 43, 64, len(text)]  # Endings after ".", abbreviation ".", and sentence "."
        self.assertEqual(find_sentence_endings(text), expected)

    def test_empty_string(self):
        text = ""
        expected = [0]  # Empty string should only have the 0th index as an "ending"
        self.assertEqual(find_sentence_endings(text), expected)

# Run the tests
if __name__ == "__main__":
    unittest.main()
