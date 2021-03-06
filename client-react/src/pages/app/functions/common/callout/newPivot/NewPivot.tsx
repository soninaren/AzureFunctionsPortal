import React, { useState } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { Formik, FormikProps } from 'formik';
import { DefaultButton, TextField } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
interface CustomPivotFormValues {
  name: string | undefined;
}

const NewPivot: React.SFC<NewConnectionCalloutProps> = props => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<CustomPivotFormValues>({ name: undefined });

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() => setNewConnection(formValues, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)}>
      {(formProps: FormikProps<CustomPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            <TextField
              label={t('newPivot_name')}
              onChange={(o, e) => {
                setFormValues({ ...formValues, name: e });
              }}
            />
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!formValues.name} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setNewConnection = (
  formValues: CustomPivotFormValues,
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.name) {
    const appSettingName = formValues.name;
    setNewAppSetting({ key: appSettingName, value: appSettingName });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default NewPivot;
