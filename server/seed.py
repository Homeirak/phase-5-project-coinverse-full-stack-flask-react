import requests
from config import app, db
from models import Crypto

cryptos = [
    ("Bitcoin", "BTC", None),
    ("Ethereum", "ETH", None),
    ("Tether USDt", "USDT", None),
    ("XRP", "XRP", None),
    ("Binance Coin", "BNB", None),
    ("Solana", "SOL", None),
    ("USD Coin", "USDC", None),
    ("Cardano", "ADA", None),
    ("Dogecoin", "DOGE", None),
    ("Toncoin", "TON", None),
    ("Avalanche", "AVAX", None),
    ("Polkadot", "DOT", None),
    ("Chainlink", "LINK", None),
    ("Polygon", "MATIC", None),
    ("Litecoin", "LTC", None),
    ("Shiba Inu", "SHIB", None),
    ("TRON", "TRX", None),
    ("Bitcoin Cash", "BCH", None),
    ("Stellar", "XLM", None),
    ("Uniswap", "UNI", None),
    ("Cosmos", "ATOM", None),
    ("Monero", "XMR", None),
    ("OKB", "OKB", None),
    ("Ethereum Classic", "ETC", None),
    ("Filecoin", "FIL", None),
    ("Internet Computer", "ICP", None),
    ("Hedera", "HBAR", None),
    ("VeChain", "VET", None),
    ("NEAR Protocol", "NEAR", None),
    ("Aptos", "APT", None),
    ("Lido DAO", "LDO", None),
    ("Algorand", "ALGO", None),
    ("Quant", "QNT", None),
    ("Arbitrum", "ARB", None),
    ("The Graph", "GRT", None),
    ("Aave", "AAVE", None),
    ("EOS", "EOS", None),
    ("Flow", "FLOW", None),
    ("MultiversX", "EGLD", None),
    ("Tezos", "XTZ", None),
    ("Axie Infinity", "AXS", None),
    ("Synthetix", "SNX", None),
    ("The Sandbox", "SAND", None),
    ("Decentraland", "MANA", None),
    ("Immutable", "IMX", None),
    ("Render", "RNDR", None),
    ("Optimism", "OP", None),
    ("Fantom", "FTM", None),
    ("Gala", "GALA", None),
    ("Curve DAO Token", "CRV", None),
    ("Enjin Coin", "ENJ", None),
    ("Chiliz", "CHZ", None),
    ("Loopring", "LRC", None),
    ("Kava", "KAVA", None),
    ("Zilliqa", "ZIL", None),
    ("Basic Attention Token", "BAT", None),
    ("Harmony", "ONE", None),
    ("Helium", "HNT", None),
    ("IOTA", "MIOTA", None),
    ("NEO", "NEO", None),
    ("Waves", "WAVES", None),
    ("Kusama", "KSM", None),
    ("Dash", "DASH", None),
    ("Decred", "DCR", None),
    ("Ravencoin", "RVN", None),
    ("0x", "ZRX", None),
    ("ICON", "ICX", None),
    ("Ontology", "ONT", None),
    ("Siacoin", "SC", None),
    ("DigiByte", "DGB", None),
    ("Nano", "NANO", None),
    ("Status", "SNT", None),
    ("Civic", "CVC", None),
    ("Dent", "DENT", None),
    ("Storj", "STORJ", None),
    ("Komodo", "KMD", None),
    ("Ark", "ARK", None),
    ("Syscoin", "SYS", None),
    ("Verge", "XVG", None),
    ("Pundi X", "PUNDIX", None),
    ("Electroneum", "ETN", None),
    ("Horizen", "ZEN", None),
    ("Lisk", "LSK", None),
    ("Stratis", "STRAX", None),
    ("NULS", "NULS", None),
    ("Wanchain", "WAN", None),
    ("Gas", "GAS", None),
    ("Bytom", "BTM", None),
    ("Nexus", "NXS", None),
    ("Factom", "FCT", None),
    ("Skycoin", "SKY", None),
    ("BitShares", "BTS", None),
    ("Peercoin", "PPC", None),
    ("RChain", "RHOC", None),
    ("Blocknet", "BLOCK", None),
    ("Metaverse ETP", "ETP", None),
    ("MOAC", "MOAC", None),
    ("Aion", "AION", None),
    ("Waltonchain", "WTC", None),
    ("Nebulas", "NAS", None),
    ("Arcblock", "ABT", None),
    ("Aergo", "AERGO", None),
    ("Aerodrome", "AERO", None),
    ("Adventure Gold", "AGLD", None),
    ("Akash Network", "AKT", None),
    ("Alchemix", "ALCX", None),
    ("MyNeighborAlice", "ALICE", None),
    ("Amp", "AMP", None),
    ("Ankr", "ANKR", None),
    ("Ape", "APE", None),
    ("Api3", "API3", None),
    ("ARPA Chain", "ARPA", None),
    ("Assemble AI", "ASM", None),
    ("Bounce Token", "AUCTION", None),
    ("Aventus", "AVT", None),
    ("Badger DAO", "BADGER", None),
    ("BICONOMY", "BICO", None),
    ("Big Time", "BIGTIME", None),
    ("Coin98", "C98", None),
    ("Celo", "CGLD", None),
    ("Compound", "COMP", None),
    ("COTI", "COTI", None),
    ("Cryptex Finance", "CTX", None),
    ("Ethereum Name Service", "ENS", None),
    ("Ethernity Chain", "ERN", None),
    ("Artificial Superintelligence Alliance", "FET", None),
    ("Shapeshift Fox Token", "FOX", None),
    ("Highstreet", "HIGH", None),
    ("IDEX", "IDEX", None),
    ("Index Cooperative", "INDEX", None),
    ("IoTex", "IOTX", None),
    ("Jasmy", "JASMY", None),
    ("Livepeer", "LPT", None),
    ("Pepe", "PEPE", None),
    ("Measurable Data Token", "MDT", None),
    ("Paxos Standard", "PAX", None),
    ("Perpetual Protocol", "PERP", None),
    ("Power Ledger", "POWR", None),
    ("Ribbon Finance", "RBN", None),
    ("SHPING", "SHPING", None),
    ("SKALE", "SKL", None),
    ("Spell Token", "SPELL", None),
    ("UMA", "UMA", None),
    ("Voxies", "VOXEL", None),
    ("Zetachain", "ZETA", None),
]

print("Fetching CoinGecko coins list...")
resp = requests.get("https://api.coingecko.com/api/v3/coins/list")
all_coins = resp.json()

def find_coingecko_id(name, symbol):
    symbol = symbol.lower()
    for coin in all_coins:
        if coin['symbol'].lower() == symbol and coin['name'].lower() == name.lower():
            return coin['id']
    for coin in all_coins:
        if coin['symbol'].lower() == symbol:
            return coin['id']
    for coin in all_coins:
        if coin['name'].lower() == name.lower():
            return coin['id']
    return None

def fetch_image_url(coingecko_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coingecko_id}"
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("image", {}).get("large") or data.get("image", {}).get("thumb")
    except Exception as e:
        print(f"Could not fetch image for {coingecko_id}: {e}")
    return None

if __name__ == "__main__":
    with app.app_context():
        added, skipped, no_image = 0, 0, 0
        for name, symbol, manual_image_url in cryptos:
            coingecko_id = find_coingecko_id(name, symbol)
            if not coingecko_id:
                print(f"Skipping {name} ({symbol}): CoinGecko ID not found.")
                skipped += 1
                continue

            exists = Crypto.query.filter(
                (Crypto.symbol == symbol) | (Crypto.coingecko_id == coingecko_id)
            ).first()
            if exists:
                print(f"Skipping {name} ({symbol}): already in DB.")
                skipped += 1
                continue

            # Use manual image URL if provided, otherwise fetch from CoinGecko
            # image_url = manual_image_url or fetch_image_url(coingecko_id)
            # use a default image if still not found
            image_url = manual_image_url or fetch_image_url(coingecko_id) or "https://yourdomain.com/default-coin.png"
            if not image_url:
                print(f"Skipping {name} ({symbol}): image_url not found.")
                no_image += 1
                continue

            new_crypto = Crypto(
                name=name,
                symbol=symbol,
                coingecko_id=coingecko_id,
                image_url=image_url
            )
            db.session.add(new_crypto)
            print(f"Added {name} ({symbol}) with CoinGecko ID: {coingecko_id} and image: {image_url}")
            added += 1

        db.session.commit()
        print(f"Done! Added {added} cryptos, skipped {skipped} (including {no_image} with no image).")
