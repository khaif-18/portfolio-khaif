/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic'
import {
  Box,
  Grid,
  GridItem,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'
import OpenGraphHead from 'components/Misc/OpenGraphHead'
import FadeInLayout from 'components/Layout/FadeWhenVisible'
import Menu from 'components/Menu'
import Sidebar from 'components/Sidebar'
import Avatar from 'components/Avatar'
import About from 'components/Sections/About'
import Experience from 'components/Sections/Experience'
import Projects from 'components/Sections/Projects'
// import FeaturedWorks from 'components/Sections/FeaturedWorks'
import ScrollMore from 'components/Misc/ScrollMore'
import { DisplayProps } from 'types/display'

// These are on bottom sections so no need to render it instantly
// const DevToArticles = dynamic(() => import('components/Sections/DevToArticles'))

const GetInTouch = dynamic(() => import('components/Sections/GetInTouch'))

const Portfolio = () => {
  const sideBarPadding = useBreakpointValue({ base: '5', md: '8', lg: '14' } as DisplayProps)
  const mainContent = useBreakpointValue({
    base: '5',
    md: '14',
    lg: '14',
    xl: '0',
  } as DisplayProps)
  const paddTop = useBreakpointValue({ base: '20', sm: '20', md: '20' } as DisplayProps)

  return (
    <>
      <OpenGraphHead />
      <Menu />
      <Grid
        id="mainGrid"
        templateColumns={{
          base: 'repeat(1, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(5, 1fr)',
        }}
        templateRows={{
          sm: 'repeat(1, 0)',
          lg: 'repeat(2, 1fr)',
        }}
        gap={4}
      >
        <GridItem
          padding={sideBarPadding}
          marginTop={paddTop}
          rowSpan={2}
          colSpan={{ base: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
          display="flex"
          alignContent="center"
          as="div"
          flexDirection={'row'}
        >
          <Sidebar />
        </GridItem>
        <GridItem
          as="main"
          padding={mainContent}
          rowSpan={2}
          colSpan={{ base: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
          overflow="hidden"
          cursor="default"
        >
          <Stack w="100" spacing={24}>
            <FadeInLayout>
              <Box
                id="aboutMe"
                className="contentRow"
                minH={{ lg: '100vh' }}
                display="flex"
                alignItems="center"
                paddingTop={{ base: 0, lg: 20, xl: 0 }}
                paddingBottom={{ base: 12, lg: 0 }}
                flexDirection={{
                  base: 'column-reverse',
                  lg: 'row',
                }}
              >
                <About />
                <Avatar />
              </Box>
            </FadeInLayout>
            <FadeInLayout>
              <Box
                id="jobs"
                className="contentRow"
                paddingTop={{ base: 0, lg: 20, xl: 0 }}
                paddingBottom={{ base: 12, lg: 10 }}
                paddingX={0}
                flexDirection={'row'}
              >
                <Experience />
              </Box>
            </FadeInLayout>
            <FadeInLayout>
              <Box
                id="projects"
                className="contentRow"
                paddingTop={{ base: 0, lg: 20, xl: 20 }}
                paddingBottom={{ base: 12, lg: 10 }}
                paddingX={0}
                flexDirection={'row'}
              >
                <Projects />
              </Box>
            </FadeInLayout>
            <FadeInLayout>
              <Box
                id="contact"
                className="contentRow"
                paddingTop={{ base: 0, lg: 20, xl: 20 }}
                paddingX={0}
                flexDirection={'row'}
              >
                <GetInTouch />
              </Box>
            </FadeInLayout>
          </Stack>
        </GridItem>
      </Grid>
      <ScrollMore />
    </>
  )
}

export default Portfolio
