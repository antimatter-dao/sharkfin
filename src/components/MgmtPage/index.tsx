import React, { useMemo } from 'react'
// import { NavLink } from 'react-router-dom'
import { Box, Typography, Grid, styled } from '@mui/material'
import { ReactComponent as ArrowLeft } from 'assets/componentsIcon/arrow_left.svg'
import theme from 'theme'
import Card, { OutlinedCard } from 'components/Card/Card'
// import Divider from 'components/Divider'
import useBreakpoint from 'hooks/useBreakpoint'
import { RiskStatement, FAQ, Subject } from './stableContent'
import ProductCardHeader from 'components/ProductCardHeader'
import { useHistory } from 'react-router-dom'

const StyledUnorderList = styled('ul')(({ theme }) => ({
  paddingLeft: '14px',
  color: '#808080',
  '& li': {
    marginTop: 10,
    fontSize: 15.5
  },
  '& li span': {
    color: '#252525'
  },
  '& li::marker': {
    color: theme.palette.primary.main
  }
}))

interface Props {
  showFaq?: boolean
  // backLink: string
  pageTitle?: string
  chart: React.ReactNode
  chart2?: React.ReactNode
  subject: Subject
  type?: string
  // subscribeForm: React.ReactNode
  returnOnInvestmentListItems: React.ReactNode[]
  vaultForm?: React.ReactNode
  children?: React.ReactNode
  graphTitle: string
  priceCurSymbol?: string
}

export default function MgmtPage(props: Props) {
  const {
    // backLink,
    pageTitle,
    chart,
    subject,
    // type,
    // subscribeForm,
    showFaq = true,
    returnOnInvestmentListItems,
    vaultForm,
    children,
    graphTitle,
    priceCurSymbol
  } = props

  const isDownMd = useBreakpoint('md')
  const history = useHistory()

  const returnOnInvestment = useMemo(() => {
    return (
      <div>
        <Typography fontSize={16} color={theme.palette.text.primary} fontWeight={500}>
          Rules of Return:
        </Typography>
        <StyledUnorderList>
          {returnOnInvestmentListItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </StyledUnorderList>
      </div>
    )
  }, [returnOnInvestmentListItems])

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        alignItems="center"
        marginBottom="auto"
        padding={{ xs: '24px 20px', md: 0 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: isDownMd ? -24 : 0,
            width: '100%',
            background: isDownMd ? theme.palette.background.default : theme.palette.background.paper,
            padding: isDownMd ? '24px 0 28px' : '27px 24px'
          }}
        >
          <Box maxWidth={theme.width.maxContent} width="100%" display="grid" position="relative">
            <Box
              // component={NavLink}
              // to={backLink}
              component="span"
              onClick={history.goBack}
              zIndex={2}
              sx={{
                textDecoration: 'none',
                display: 'block',
                width: 'max-content',
                '&:hover': {
                  cursor: 'pointer'
                }
              }}
            >
              <ArrowLeft />
              <Typography component="span" color={theme.bgColor.bg1} fontSize={{ xs: 12, md: 14 }} ml={16}>
                Go Back
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box padding={isDownMd ? 0 : '60px 0'} sx={{ maxWidth: theme.width.maxContent }} width="100%">
          <Box
            mb={isDownMd ? 24 : 60}
            display="flex"
            gap={{ xs: 0, md: 8 }}
            flexDirection={isDownMd ? 'column' : 'row'}
            width="100%"
          >
            {pageTitle && (
              <ProductCardHeader
                title={pageTitle}
                priceCurSymbol={priceCurSymbol}
                description=""
                titleSize={isDownMd ? '32px' : '44px'}
              />
            )}
          </Box>

          <Grid container spacing={20}>
            {vaultForm && (
              <Grid xs={12} item>
                <Card>
                  <Grid container spacing={20}>
                    <Grid item xs={12} md={5}>
                      {vaultForm}
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        gap="20px"
                        maxWidth="100%"
                        height="100%"
                        width="100%"
                        padding="32px 24px"
                      >
                        <Box display="flex" justifyContent={'space-between'} gap={13}>
                          <Typography fontSize={{ xs: 20, md: 24 }} fontWeight={700}>
                            {graphTitle}
                          </Typography>

                          <Box display="flex" alignItems="center" gap={8}>
                            <Box height={10} width={10} borderRadius="50%" bgcolor="black" />
                            <Typography fontSize={12} noWrap>
                              Market Price
                            </Typography>
                          </Box>
                          {/* <Box display="flex" alignItems="center" gap={8}>
                              <Box height={10} width={10} borderRadius="50%" bgcolor="#F0B90B" />
                              <Typography fontSize={12} color="#F0B90B">
                                Strike Price
                              </Typography>
                            </Box> */}
                        </Box>
                        <Box sx={{ maxWidth: '100%' }} mt={20}>
                          <Box maxHeight="100%" height="100%" gap={0} display={{ xs: 'grid', md: 'flex' }}>
                            {chart}
                          </Box>
                        </Box>
                        {isDownMd ? (
                          <Box>
                            {/* <Divider extension={24} sx={{ opacity: 0.1, marginBottom: 20 }} /> */}
                            {returnOnInvestment}
                          </Box>
                        ) : (
                          <OutlinedCard padding="16px 20px">{returnOnInvestment}</OutlinedCard>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            )}

            {children && <>{children}</>}

            <Grid xs={12} item>
              <Card style={{ height: '100%' }}>
                <RiskStatement subject={subject} />
              </Card>
            </Grid>

            {showFaq && (
              <Grid xs={12} item>
                <Card style={{ height: '100%' }} padding="32px 24px">
                  <FAQ subject={subject} />
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  )
}
