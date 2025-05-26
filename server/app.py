# App.py
import logging
from config import app, api
from routes.loginroute import LoginResource
from routes.registrationroute import RegistrationResource
from routes.dashboardroute import DashboardResource
from routes.marketroute import MarketResource, WatchlistMarketResource, TradeMarketResource
from routes.historyroute import HistoryResource
from routes.depositroute import DepositResource
from routes.logoutroute import LogoutResource
from routes.check_current_userroute import CheckCurrentUserResource
from routes.profileroute import ProfileResource
from models import User, Crypto, Holding, Trade, Watchlist

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        # this keeps logs in the CLI too
        logging.StreamHandler()  
    ]
)
logger = logging.getLogger(__name__)

# Register API resources
api.add_resource(LoginResource, '/login', '/api/login')
api.add_resource(RegistrationResource, '/register', '/api/register')
api.add_resource(DashboardResource, '/dashboard', '/api/dashboard')
api.add_resource(MarketResource, '/market', '/api/market')
api.add_resource(
    WatchlistMarketResource,
    '/api/market/watchlist',
    '/api/market/watchlist/<int:crypto_id>'
)
api.add_resource(
    TradeMarketResource,
    '/api/market/trade/<int:crypto_id>',
    '/api/market/trade/<int:crypto_id>/<int:trade_id>'
)
api.add_resource(HistoryResource, '/history', '/api/history')
api.add_resource(DepositResource, '/deposit', '/api/deposit')
api.add_resource(LogoutResource, '/logout', '/api/logout')
api.add_resource(CheckCurrentUserResource, '/check_current_user', '/api/check_current_user')
api.add_resource(ProfileResource, '/profile','/api/profile')


if __name__ == "__main__":
    app.run(port=5555, debug=True)