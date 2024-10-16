from typing import Callable
from app.logger import Logger
import schedule
import threading
import time

class ProcessScheduler:
    """
    A scheduler that manages a queue of processes to be executed.

    It periodically checks the queue and executes processes if any are present.
    If the queue becomes empty, the scheduler automatically stops to conserve resources.
    The scheduler can be started and stopped as needed, and new processes can be added to the queue at any time.
    """
    def __init__(self, secs: int, executor: Callable[[int], None], logger: Logger):
        self.waiting_processes = []
        self.scheduler_thread = None
        self.scheduler_running = False
        self.executor = executor
        self.logger = logger
        schedule.every(secs).seconds.do(self._reprocess_holding_processes)

    def _reprocess_holding_processes(self):
        """Internal method to process tasks in the queue."""
        if self.waiting_processes:
            id = self.waiting_processes.pop(0)
            self.logger.info(f"[ProcessScheduler]: Executing process from queue [{id}]")
            self.executor(id)
        else:
            self.stop_scheduler()

    def _run_scheduler(self):
        """Internal method to continuously run the scheduler."""
        while self.scheduler_running:
            schedule.run_pending()
            time.sleep(1)

    def start_scheduler(self):
        """Start the scheduler thread if it's not already running."""
        if not self.scheduler_running:
            self.logger.info("[ProcessScheduler]: Starting scheduler")
            self.scheduler_running = True
            self.scheduler_thread = threading.Thread(target=self._run_scheduler)
            self.scheduler_thread.daemon = True
            self.scheduler_thread.start()
        else:
            self.logger.info("[ProcessScheduler]: Scheduler is already running")

    def stop_scheduler(self):
        """Stop the scheduler thread."""
        self.scheduler_running = False
        self.logger.info("[ProcessScheduler]: Scheduler stopped")

    def add_process_to_queue(self, process_id: int) -> None:
        """Add a process to the queue and start the scheduler if needed."""
        self.waiting_processes.append(process_id)
        self.logger.info(f"[ProcessScheduler]: Scheduler adding process [{process_id}]")
        self.start_scheduler()


if __name__ == "__main__":

    def print_process(process):
        print(process)

    scheduler = ProcessScheduler(15, print_process)

    # Add processes to the queue and start processing
    scheduler.add_process_to_queue("Process 1")
    time.sleep(3)  # Simulate some time for processing

    # Add more processes to the queue
    scheduler.add_process_to_queue("Process 2")
    time.sleep(3)

    # Simulate waiting for some time to see the scheduler behavior
    time.sleep(300)  # Wait 2 minutes to observe scheduler stopping when empty
