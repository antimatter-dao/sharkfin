export const routes = {
  accountTab: '/account/:tab',
  accountTabType: '/account/:tab/:type',
  noService: 'no-service',
  sharkfin: '/',
  sharkfinMgmt: '/sharkfin-mgmt/:chainName/:currency/:type',
  chainOption: '/chain-option',
  dualInvest: '/dual-invest',
  defiVault: '/defi',
  chainOptionTyped: '/chain-option/:type',
  chainOptionMgmt: '/chain-option-mgmt/:id',
  dualInvestMgmt: '/dual-invest-mgmt/:id',
  dualInvestMgmtImg: '/dual-invest-mgmt/:id/:orderId',
  home: '/home',
  defiVaultMgmt: '/defi-vault-mgmt/:chainName/:currency/:type',
  recurringVault: '/recurring-vault',
  recurringVaultMgmt: '/recurring-vault-mgmt/:currency/:type',
  referral: '/:referrer'
}

export const SHARE_URL = window.location.origin.toString() + '/#/dual_invest_mgmt/:id/:orderId'
