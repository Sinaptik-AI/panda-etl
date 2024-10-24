import unittest

from app.utils import find_following_sentence_ending


class TestFindFollowingSentenceEnding(unittest.TestCase):
    def test_basic_case(self):
        sentence_endings = [10, 20, 30, 40]
        index = 15
        expected = 20  # Closest ending greater than 15 is 20
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

    def test_no_greater_ending(self):
        sentence_endings = [10, 20, 30]
        index = 35
        expected = 35  # No greater ending than 35, so it returns the index itself
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

    def test_at_ending_boundary(self):
        sentence_endings = [10, 20, 30, 40]
        index = 30
        expected = 40  # The next greater ending after 30 is 40
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

    def test_first_sentence(self):
        sentence_endings = [10, 20, 30, 40]
        index = 5
        expected = 10  # The closest ending greater than 5 is 10
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

    def test_empty_sentence_endings(self):
        sentence_endings = []
        index = 5
        expected = 5  # No sentence endings, so return the index itself
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

    def test_same_index_as_last_ending(self):
        sentence_endings = [10, 20, 30]
        index = 30
        expected = 30  # At the last sentence ending, return the index itself
        self.assertEqual(find_following_sentence_ending(sentence_endings, index), expected)

# Run the tests
if __name__ == "__main__":
    unittest.main()
