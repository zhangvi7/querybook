import { Form, Formik } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

import { GitHubResource } from 'resource/github';
import { Button } from 'ui/Button/Button';
import { FormWrapper } from 'ui/Form/FormWrapper';
import { SimpleField } from 'ui/FormikField/SimpleField';
import { Loading } from 'ui/Loading/Loading';
import { Message } from 'ui/Message/Message';
import { AccentText } from 'ui/StyledText/StyledText';

interface IProps {
    docId: number;
    onDirectorySelect: (directory: string) => void;
}

const validationSchema = Yup.object().shape({
    directory: Yup.string().nullable(),
});

export const GitHubDirectorySelection: React.FunctionComponent<IProps> = ({
    docId,
    onDirectorySelect,
}) => {
    const [directories, setDirectories] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchDirectories = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await GitHubResource.getDirectories(docId);
            setDirectories(data.directories);
        } catch (error) {
            console.error('Failed to fetch directories:', error);
            setErrorMessage('Failed to fetch directories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [docId]);

    useEffect(() => {
        fetchDirectories();
    }, [fetchDirectories]);

    const directoryOptions = useMemo(
        () => directories.map((dir) => ({ label: dir, value: dir })),
        [directories]
    );

    const handleCreateNewDirectory = async (
        inputValue: string,
        setFieldValue: (
            field: string,
            value: any,
            shouldValidate?: boolean
        ) => void
    ) => {
        try {
            setFieldValue('directory', inputValue);
        } catch (error) {
            console.error('Failed to create directory:', error);
            setErrorMessage('Failed to create directory. Please try again.');
            return null;
        }
    };

    const formatCreateLabel = (inputValue: string) => (
        <Message
            message={`Create '${inputValue}' directory`}
            icon="Plus"
            iconSize={16}
            type="info"
        />
    );

    return (
        <Formik
            initialValues={{
                directory: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                const directory = values.directory || 'datadocs';
                onDirectorySelect(directory);
            }}
        >
            {({ handleSubmit, isSubmitting, isValid, setFieldValue }) => (
                <FormWrapper
                    className="GitHubDirectorySelection"
                    minLabelWidth="150px"
                >
                    <AccentText size="med" color="text" weight="light">
                        Select or Create Directory
                    </AccentText>
                    <Message
                        message="Select an existing directory or create a new one. If left empty, it defaults to 'datadocs'. This directory will be used for DataDoc commits and version history."
                        type="info"
                    />
                    <Message
                        message="Note: New directories won't be created until you push a commit."
                        type="tip"
                    />
                    {errorMessage && (
                        <Message message={errorMessage} type="error" />
                    )}
                    {isLoading ? (
                        <Loading text="Loading all GitHub directories..." />
                    ) : (
                        <Form>
                            <SimpleField
                                name="directory"
                                label="Directory"
                                type="react-select"
                                options={directoryOptions}
                                creatable
                                formatCreateLabel={formatCreateLabel}
                                onCreateOption={(inputValue) =>
                                    handleCreateNewDirectory(
                                        inputValue,
                                        setFieldValue
                                    )
                                }
                                onChange={(option) => {
                                    setFieldValue('directory', option);
                                }}
                                help="Select an existing directory or create a new one. Defaults to 'datadocs' if left empty."
                            />
                            <br />
                            <div className="center-align">
                                <Button
                                    onClick={() => handleSubmit()}
                                    title="Link Directory"
                                    disabled={isSubmitting || !isValid}
                                />
                            </div>
                        </Form>
                    )}
                </FormWrapper>
            )}
        </Formik>
    );
};
