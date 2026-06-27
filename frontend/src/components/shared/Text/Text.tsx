import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import styles from './Text.module.css'
import type { TextAlign, TextColor, TextFontWeight, TextSize, TextTag } from './types'

const FONT_WEIGHT_MAP: Record<Exclude<TextFontWeight, number>, number> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const ALIGN_CLASS: Record<TextAlign, string> = {
  left: styles.alignLeft,
  right: styles.alignRight,
  center: styles.alignCenter,
}

const SIZE_CLASS: Record<TextSize, string> = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
}

const COLOR_CLASS: Record<TextColor, string> = {
  red: styles.colorRed,
  blue: styles.colorBlue,
  yellow: styles.colorYellow,
  green: styles.colorGreen,
  orange: styles.colorOrange,
  purple: styles.colorPurple,
  pink: styles.colorPink,
  black: styles.colorBlack,
  white: styles.colorWhite,
  gray: styles.colorGray,
  primary: styles.colorPrimary,
  secondary: styles.colorSecondary,
  heading: styles.colorHeading,
}

export interface TextProps extends HTMLAttributes<HTMLElement> {
  tag?: TextTag
  fontWeight?: TextFontWeight
  size?: TextSize
  color?: TextColor
  align?: TextAlign
  children: ReactNode
}

const resolveFontWeight = (fontWeight: TextFontWeight): number =>
  typeof fontWeight === 'number' ? fontWeight : FONT_WEIGHT_MAP[fontWeight]

export const Text = ({
  tag: Tag = 'span',
  fontWeight = 'regular',
  size = 'medium',
  color = 'black',
  align = 'left',
  className,
  style,
  children,
  ...rest
}: TextProps) => {
  const classes = [
    styles.text,
    SIZE_CLASS[size],
    ALIGN_CLASS[align],
    color && COLOR_CLASS[color],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inlineStyle: CSSProperties = {
    fontWeight: resolveFontWeight(fontWeight),
    ...style,
  }

  return (
    <Tag className={classes} style={inlineStyle} {...rest}>
      {children}
    </Tag>
  )
}
