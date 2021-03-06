import React from 'react';
import { addEditFormStyle } from '../../../../../components/form-controls/formControl.override.styles';
import ActionBar from '../../../../../components/ActionBar';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import FunctionTestInput from './FunctionTestInput';
import FunctionTestOutput from './FunctionTestOutput';

export interface FunctionTestProps {
  run: () => void;
  cancel: () => void;
}

const pivotWrapper = style({
  paddingLeft: '8px',
});

// TODO (krmitta): Add Content for Function test panel [WI: 5536379]
const FunctionTest: React.SFC<FunctionTestProps> = props => {
  const { t } = useTranslation();
  const { run, cancel } = props;

  const actionBarPrimaryButtonProps = {
    id: 'run',
    title: t('run'),
    onClick: run,
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  const getPivotTabId = (itemKey: string, index: number): string => {
    switch (itemKey) {
      case 'input':
        return 'function-test-input';
      case 'output':
        return 'function-test-output';
      default:
        return '';
    }
  };

  return (
    <form className={addEditFormStyle}>
      <Pivot getTabId={getPivotTabId}>
        <PivotItem className={pivotWrapper} itemKey="input" linkText={t('functionTestInput')}>
          <FunctionTestInput />
        </PivotItem>
        <PivotItem className={pivotWrapper} itemKey="output" linkText={t('functionTestOutput')}>
          <FunctionTestOutput />
        </PivotItem>
      </Pivot>
      <ActionBar id="function-test-footer" primaryButton={actionBarPrimaryButtonProps} secondaryButton={actionBarSecondaryButtonProps} />
    </form>
  );
};

export default FunctionTest;
