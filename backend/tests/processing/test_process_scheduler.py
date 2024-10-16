import unittest
from unittest.mock import MagicMock, patch
from app.processing.process_scheduler import ProcessScheduler

class TestProcessScheduler(unittest.TestCase):
    def setUp(self):
        self.executor_mock = MagicMock()  # Mock the executor function
        self.logger_mock = MagicMock()    # Mock the logger
        self.scheduler = ProcessScheduler(1, self.executor_mock, self.logger_mock)

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_add_process_to_queue(self, _):
        # Test adding a process to the queue and ensure it's added correctly
        process_id = 1
        self.scheduler.add_process_to_queue(process_id)

        # Check if the process is added to the waiting_processes list
        self.assertIn(process_id, self.scheduler.waiting_processes)

        # Check if the scheduler was started
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Starting scheduler")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_reprocess_holding_processes(self, _):
        # Test processing when queue is not empty
        process_id = 2
        self.scheduler.waiting_processes = [process_id]

        self.scheduler._reprocess_holding_processes()

        # Ensure the executor was called with the process_id
        self.executor_mock.assert_called_once_with(process_id)

        # Ensure the logger recorded the correct process execution
        self.logger_mock.info.assert_any_call(f"[ProcessScheduler]: Executing process from queue [{process_id}]")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_stop_scheduler_when_empty(self, _):
        # Test if the scheduler stops when there are no processes left
        self.scheduler.waiting_processes = []  # Empty the queue
        self.scheduler._reprocess_holding_processes()

        # Ensure the scheduler stops
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Scheduler stopped")
        self.assertFalse(self.scheduler.scheduler_running)

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_scheduler_starts_when_needed(self, _):
        # Test if the scheduler starts when a new process is added
        process_id = 3
        self.scheduler.start_scheduler()

        self.scheduler.add_process_to_queue(process_id)

        # Ensure the process was added and scheduler started
        self.assertIn(process_id, self.scheduler.waiting_processes)
        self.logger_mock.info.assert_any_call(f"[ProcessScheduler]: Scheduler adding process [{process_id}]")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_scheduler_does_not_double_start(self, _):
        # Test that scheduler doesn't start twice if it's already running
        self.scheduler.scheduler_running = True  # Simulate running scheduler

        self.scheduler.start_scheduler()

        # Ensure that a log is made saying it's already running
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Scheduler is already running")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_stop_scheduler(self, _):
        # Test stopping the scheduler manually
        self.scheduler.start_scheduler()
        self.scheduler.stop_scheduler()

        # Check if scheduler is stopped
        self.assertFalse(self.scheduler.scheduler_running)
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Scheduler stopped")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_reprocess_multiple_processes(self, _):
        # Test reprocessing when there are multiple processes in the queue
        process_ids = [1, 2, 3]
        self.scheduler.waiting_processes = process_ids.copy()

        # Simulate running the scheduler multiple times
        self.scheduler._reprocess_holding_processes()
        self.scheduler._reprocess_holding_processes()
        self.scheduler._reprocess_holding_processes()

        # Ensure each process was executed in the correct order
        self.executor_mock.assert_has_calls([
            unittest.mock.call(1),
            unittest.mock.call(2),
            unittest.mock.call(3),
        ])
        self.assertEqual(self.scheduler.waiting_processes, [])

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_no_processes_added(self, _):
        # Test the behavior when no processes are added
        self.scheduler.start_scheduler()
        self.scheduler._reprocess_holding_processes()

        # Scheduler should stop since no processes were added
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Scheduler stopped")
        self.assertFalse(self.scheduler.scheduler_running)

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_scheduler_stops_when_empty_after_processing(self, _):
        # Test that the scheduler stops after processing all tasks
        process_id = 1
        self.scheduler.waiting_processes = [process_id]

        # Process the task
        self.scheduler._reprocess_holding_processes()

        # Explicitly stop the scheduler after processing
        self.scheduler.stop_scheduler()

        # Ensure the scheduler stopped after processing the last task
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Scheduler stopped")

    @patch('time.sleep', return_value=None)  # Mocking sleep to avoid delays
    def test_scheduler_restart_after_adding_new_process(self, _):
        # Test if the scheduler restarts when a new process is added after stopping
        process_id_1 = 1
        process_id_2 = 2
        self.scheduler.waiting_processes = [process_id_1]

        # Process the first task and stop the scheduler
        self.scheduler._reprocess_holding_processes()
        self.assertFalse(self.scheduler.scheduler_running)

        # Add a new process and ensure the scheduler restarts
        self.scheduler.add_process_to_queue(process_id_2)
        self.assertTrue(self.scheduler.scheduler_running)
        self.logger_mock.info.assert_any_call(f"[ProcessScheduler]: Scheduler adding process [{process_id_2}]")
        self.logger_mock.info.assert_any_call("[ProcessScheduler]: Starting scheduler")

if __name__ == '__main__':
    unittest.main()
