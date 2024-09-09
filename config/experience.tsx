import { Link } from '@chakra-ui/react'

export type Company =  'HUAWEI' | 'BPKP' | 'BRT' | 'Studycle'

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
  HUAWEI: {
    name: 'HUAWEI',
    longName: 'Huawei Technologies Investment',
    subDetail:
      'Telecommunications Department',
    url: 'https://www.huawei.com/',
    position: 'Full Stack Developer',
    duration: 'Februari 2024 - Present',
    logo: {
      light: '/worked_at_logos/huawei/logo_huawei.png',
      dark: '/worked_at_logos/huawei/logo_huawei_dark.png',
    },
    roles: [
      <>
        Worked with Iternal Develop Apps{' '}
        <Link
          aria-label="HUAWEI"
          href="https://www.huawei.com/"
          target="_blank"
          rel="noreferrer"
        >
          HUAWEI.
        </Link>
      </>,
      <>
        Take a part in developing the new feature of the app, and also make Task Management for the team.
      </>,
      <>
        Handle some of the team's technical problems, and make Learning path for the team.
      </>
    ],
  },
  BPKP: {
    name: 'BPKP',
    longName: 'Badan Pengawasan Keuangan dan Pembangunan',
    subDetail:
      'a state institution engaged in financial and development supervision.',
    url: 'https://www.bpkp.go.id/',
    position: 'Software Engineer',
    duration: 'July 2023 - Februari 2024',
    logo: {
      light: '/worked_at_logos/bpkp/logo_bpkp.png',
      dark: '/worked_at_logos/bpkp/logo_bpkp_dark.png',
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
        </Link>
      </>,
    ],
  },
  BRT: {
    name: 'BRT',
    longName: 'Bangun Ruang Teknologi',
    subDetail: 'Telecommunications Department',
    url: '/#',
    position: 'Frontend Engineer',
    duration: 'March 2023 - Februari 2024',
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
      dark: '/worked_at_logos/studycle/logo_studycle_dark.png',
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
  Experiences.HUAWEI,
  Experiences.BPKP,
  Experiences.BRT,
  Experiences.Studycle,
]
