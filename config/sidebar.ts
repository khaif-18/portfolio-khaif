import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'
import { IconType } from 'react-icons/lib/esm/iconBase'

type SocialMedia = {
  label: string
  href: string
  icon: IconType
}

export const SocialMedias: SocialMedia[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/khalfh_her',
    icon: FaInstagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/khalifah-erian/',
    icon: FaLinkedin,
  },
  {
    label: 'Github',
    href: 'https://github.com/khaif-18',
    icon: FaGithub,
  },
]
