import { Text } from 'react-native';
import { colors, fonts } from '../theme';

// Text with the Cairo font, and right-to-left alignment when the app is in Arabic.
export default function T({ weight = 'regular', rtl, style, ...props }) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: fonts[weight], color: colors.text, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' },
        style,
      ]}
    />
  );
}
