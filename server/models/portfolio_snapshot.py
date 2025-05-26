from config import db
from sqlalchemy_serializer import SerializerMixin

class PortfolioSnapshot(db.Model, SerializerMixin):
    __tablename__ = "portfolio_snapshots"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete='CASCADE'))
    timestamp = db.Column(db.DateTime, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    holdings_json = db.Column(db.JSON, nullable=True)

    serialize_rules = (
        '-user.trades', 
        '-user.holdings',
        '-user.watchlists', 
        '-user.portfolio_snapshots',
    )
    user = db.relationship("User", backref="portfolio_snapshots")

    def __repr__(self):
        return f"<PortfolioSnapshot user_id={self.user_id} timestamp={self.timestamp} value={self.total_value}>"