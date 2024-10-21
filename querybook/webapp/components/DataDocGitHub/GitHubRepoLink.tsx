import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { Button } from 'ui/Button/Button';
import { FormWrapper } from 'ui/Form/FormWrapper';
import { SimpleField } from 'ui/FormikField/SimpleField';
import { AccentText } from 'ui/StyledText/StyledText';

interface IProps {
    onRepoLink: (values: {
        repoUrl: string;
        branch?: string;
        filePath?: string;
    }) => void;
}

const validationSchema = Yup.object().shape({
    repoUrl: Yup.string().required('Repo Url is required'),
    branch: Yup.string().nullable(),
    filePath: Yup.string().nullable(),
});

export const GitHubRepoLink: React.FunctionComponent<IProps> = ({
    onRepoLink,
}) => (
    <Formik
        initialValues={{
            repoUrl: '',
            branch: null,
            filePath: null,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
            onRepoLink(values);
        }}
    >
        {({ handleSubmit, isSubmitting, isValid }) => (
            <FormWrapper className="GitHubRepoLink" minLabelWidth="150px">
                <AccentText size="med" color="text" weight="light">
                    Link Datadoc to GitHub
                </AccentText>
                <Form>
                    <SimpleField
                        name="repoUrl"
                        label="Repo Url"
                        placeholder="querybook-datadocs"
                        type="input"
                        required
                    />
                    <SimpleField
                        name="branch"
                        label="Branch"
                        placeholder="main"
                        type="input"
                    />
                    <SimpleField
                        name="filePath"
                        label="File Path"
                        placeholder="datadocs/datadoc_{datadoc_id}.md"
                        type="input"
                    />
                    <br />
                    <div className="center-align">
                        <Button
                            onClick={() => handleSubmit()}
                            title="Link Repository"
                            disabled={isSubmitting || !isValid}
                        />
                    </div>
                </Form>
            </FormWrapper>
        )}
    </Formik>
);
