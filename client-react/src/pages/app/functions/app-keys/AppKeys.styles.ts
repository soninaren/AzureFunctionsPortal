import { style } from 'typestyle';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';

export const commandBarSticky = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const formStyle = style({
  padding: '5px 20px',
});

export const messageBanner = (theme: ThemeExtended) =>
  style({
    backgroundColor: theme.semanticColors.infoBackground,
    paddingLeft: '5px',
  });

export const filterBoxStyle = { root: { marginTop: '5px', height: '25px', width: '100%' } };
export const tableActionButtonStyle = { root: { marginTop: '5px' } };
export const addPanelCommandBar = (theme: ThemeExtended) =>
  style({
    borderBottom: '1px solid rgba(204,204,204,.8)',
    backgroundColor: theme.semanticColors.bodyBackground,
    width: '100%',
    marginBottom: '50px',
  });

export const disableIFrameStyle = style({
  top: '0px',
  left: '0px',
  bottom: '0px',
  right: ' 0px',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  opacity: 0.8,
  zIndex: 1,
  position: 'absolute',
});

export const renewTextStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.actionLink,
    cursor: 'pointer',
  });
