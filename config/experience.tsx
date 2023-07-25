import { Link } from '@chakra-ui/react'

export type Company = 'BPKP' | 'BRT' | 'Studycle'

export type CompanyDetail = {
  name: string
  longName: string
  subDetail?: string
  url: string
  position: string
  duration: string
  logo: {
    light: string
    dark?: string
  }
  roles?: JSX.Element[]
}

export const Experiences: {
  [key in Company]: CompanyDetail
} = {
  BPKP: {
    name: 'BPKP',
    longName: 'Badan Pengawasan Keuangan dan Pembangunan',
    subDetail:
      'a state institution engaged in financial and development supervision.',
    url: 'https://www.bpkp.go.id/',
    position: 'Software Engineer',
    duration: 'July 2023 - Present',
    logo: {
      light: '/worked_at_logos/deloitte/Deloitte_logo_black.png',
      dark: '/worked_at_logos/deloitte/Deloitte_logo.png',
    },
    roles: [
      <>
        Worked on maintaining{' '}
        <Link
          aria-label="SIMA-NG BPKP"
          href="https://www.bpkp.go.id/"
          target="_blank"
          rel="noreferrer"
        >
          SIMA-NG BPKP.
        </Link>{' '}
        Written in Next Typescript.
      </>,
    ],
  },
  BRT: {
    name: 'BRT',
    longName: 'Bangun Ruang Teknologi',
    subDetail: 'Telecommunications Department',
    url: '/#',
    position: 'Frontend Engineer',
    duration: 'March 2023 - Present',
    logo: {
      light: '/worked_at_logos/scg/SCG_400x400.jpg',
      dark: '/worked_at_logos/scg/SCG.png',
    },
    roles: [
      <>
        Migration the Web Portal App into a new. Using NextJS and Typescript.
        Restructuring the old Web Portal App into a newer architectural design
        approach.
      </>,
    ],
  },
  Studycle: {
    name: 'Studycle',
    longName: 'Studycle Education and Technology',
    subDetail: 'Edcation',
    url: 'https://blotocol.com/',
    position: 'Software Developer/Project Manager (Intern)',
    duration: 'Aug 2021 - Jan 2022',
    logo: {
      light: '/worked_at_logos/ivp/blotocol_logo-dark.png',
      dark: '/worked_at_logos/ivp/blotocol-logo-white.png',
    },
    roles: [
      <>Learn Many thing, such React.Js, Redux, Django</>,
      <>Solve Challenge, make some Movie DB web app with Flask and Open API.</>,
      <>
        Join core team, and responsible to make theme provider component in
        React JS
      </>,
      <>Learn to run the application using Docker</>,
    ],
  },
}

export const ExperiencesList = [
  Experiences.BPKP,
  Experiences.BRT,
  Experiences.Studycle,
]
