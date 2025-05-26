from apscheduler.schedulers.blocking import BlockingScheduler
from generate_snapshots import generate_portfolio_snapshots

scheduler = BlockingScheduler()

# Schedule the job every 5 minutes
scheduler.add_job(generate_portfolio_snapshots, 'interval', minutes=5)

if __name__ == "__main__":
    print("Starting snapshot scheduler...")
    scheduler.start()