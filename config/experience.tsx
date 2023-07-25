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
      light: '/worked_at_logos/bpkp/logo_bpkp.png',
      dark: '/worked_at_logos/logo_const.png',
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
      light: '/worked_at_logos/logo_const.png',
      dark: '/worked_at_logos/logo_const.png',
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
      light: '/worked_at_logos/studycle/logo_studycle.png',
      dark: '/worked_at_logos/studycle/logo_studycle.png',
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
