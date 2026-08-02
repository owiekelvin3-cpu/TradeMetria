-- Seed default deposit configuration (crypto wallets + partner links)
INSERT INTO platform_settings (key, value)
VALUES (
  'deposit_config',
  '{
    "cryptoWallets": {
      "bitcoin": "bc1qtrademetria7x8k2mdepositwallet9f4h2j",
      "ethereum": "0xTradeMetria742DepositWallet8a3f9c2e1b",
      "usdt": "0xTradeMetria742DepositWallet8a3f9c2e1b",
      "bnb": "0xTradeMetria742DepositWallet8a3f9c2e1b",
      "solana": "TradeMetriaDep0s1tWa11etSo1ana9xK2m",
      "xrp": "rTradeMetriaDepositWallet9XRP8k2m4n",
      "litecoin": "ltc1qtrademetriadepositwallet7k2m9x",
      "dogecoin": "DTradeMetriaDepositWallet9DOGE2k"
    },
    "cryptoPartners": [
      {
        "id": "moonpay",
        "name": "MoonPay",
        "descriptionKey": "deposits.partnerMoonPayDesc",
        "url": "https://www.moonpay.com/buy",
        "color": "#7B3FE4",
        "tagKey": "deposits.partnerRecommended",
        "enabled": true
      },
      {
        "id": "transak",
        "name": "Transak",
        "descriptionKey": "deposits.partnerTransakDesc",
        "url": "https://global.transak.com",
        "color": "#0052FF",
        "enabled": true
      }
    ],
    "giftCardPartners": [
      {
        "id": "raise",
        "name": "Raise",
        "descriptionKey": "deposits.partnerRaiseDesc",
        "url": "https://www.raise.com",
        "color": "#E31837",
        "tagKey": "deposits.partnerRecommended",
        "enabled": true
      },
      {
        "id": "gyft",
        "name": "Gyft",
        "descriptionKey": "deposits.partnerGyftDesc",
        "url": "https://www.gyft.com",
        "color": "#00A4E4",
        "enabled": true
      }
    ]
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
