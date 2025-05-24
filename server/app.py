# App.py
from config import app, api
from routes.loginroute import LoginResource
from routes.registrationroute import RegistrationResource
from routes.dashboardroute import DashboardResource
from routes.marketroute import MarketResource, WatchlistMarketResource, TradeMarketResource
from routes.historyroute import HistoryResource
from routes.depositroute import DepositResource
from routes.logoutroute import LogoutResource
from routes.check_current_userroute import CheckCurrentUserResource
from models import User, Crypto, Holding, Trade, Watchlist

# Register API resources
api.add_resource(LoginResource, '/login')
api.add_resource(RegistrationResource, '/register')
api.add_resource(DashboardResource, '/dashboard')
api.add_resource(MarketResource, '/market')
api.add_resource(WatchlistMarketResource, '/market/watchlist', '/market/<int:crypto_id>/watchlist')
api.add_resource(TradeMarketResource, '/market/<int:crypto_id>/trade', '/market/<int:crypto_id>/trade/<int:trade_id>')
api.add_resource(HistoryResource, '/history')
api.add_resource(DepositResource, '/deposit')
api.add_resource(LogoutResource, '/logout')
api.add_resource(CheckCurrentUserResource, '/check_current_user')

if __name__ == "__main__":
    app.run(port=5555, debug=True)