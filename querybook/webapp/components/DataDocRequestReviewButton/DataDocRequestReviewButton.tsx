import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { QueryExecutionRequestReviewResource } from 'resource/queryExecution';
import { Button } from 'ui/Button/Button';
import {
    FormField,
    FormFieldErrorSection,
    FormFieldHelpSection,
    FormFieldInputSection,
    FormFieldInputSectionRow,
    FormFieldInputSectionRowGroup,
} from 'ui/Form/FormField';
import { Modal } from 'ui/Modal/Modal';

interface FormInputs {
    slackReviewers: string[];
}

const ReviewerForm: React.FC<{
    onRequestReviewClick: (reviewers: string[]) => Promise<any>;
    setIsModalVisible: (isVisible: boolean) => void;
}> = ({ onRequestReviewClick, setIsModalVisible }) => {
    const validationSchema = Yup.object({
        slackReviewers: Yup.array()
            .of(Yup.string())
            .required('Slack reviewers are required'),
    });

    const onSubmit = async (
        values: FormInputs,
        { setSubmitting, setStatus }
    ) => {
        try {
            const reviewers = values.slackReviewers;
            const queryId = onRequestReviewClick(reviewers);
            setIsModalVisible(false);

            // Call API to request review (Send data to the server)
            // QueryExecutionRequestReviewResource.create(
            //     query,
            //     engine_id,
            //     reviewers
            // ).then(() => {
            //     setIsModalVisible(false);
            //     alert('Review Requested! Alert');
            //     toast.success('Review Requested! Toast');
            // });

            // const response = await axios.post('/api/schedule', values);

            // TODO: handle error + status for QueryExecutionRequestReviewResource call
            // if (response.status === 200) {
            //     setStatus('Schedule created successfully');
            // } else {
            //     setStatus('Failed to create schedule');
            // }
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }

        setSubmitting(false);
    };

    return (
        <Formik
            initialValues={{ slackReviewers: [] }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ isSubmitting }) => (
                <>
                    <Form>
                        <label>
                            Slack User:
                            <Field name="slackUser" type="text" />
                            <ErrorMessage name="slackUser" component="div" />
                        </label>

                        <button type="submit" disabled={isSubmitting}>
                            Submit
                        </button>
                    </Form>

                    <FormField>
                        <FormFieldInputSectionRowGroup>
                            <FormFieldInputSectionRow>
                                <FormFieldInputSection>
                                    Test
                                </FormFieldInputSection>
                            </FormFieldInputSectionRow>
                            <FormFieldHelpSection>Test</FormFieldHelpSection>
                            <FormFieldErrorSection>Test</FormFieldErrorSection>
                        </FormFieldInputSectionRowGroup>
                    </FormField>
                </>
            )}
        </Formik>
    );
};

interface IProps {
    onRequestReviewClick: (reviewers: string[]) => Promise<any>;
}

export const DataDocRequestReviewbutton: React.FunctionComponent<IProps> = ({
    query,
    onRequestReviewClick,
    ...props
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reviewers, setReviewers] = useState([]);
    // const notifiers = useSelector(notificationServiceSelector);

    return (
        <div>
            <Button onClick={() => setIsModalVisible(true)}>
                Request Review
            </Button>
            {isModalVisible && (
                <Modal
                    title="Request Reviewers"
                    onHide={() => setIsModalVisible(false)}
                >
                    {/* <FormSectionHeader>Notification</FormSectionHeader> */}
                    <ReviewerForm
                        onClick={onRequestReviewClick}
                        setIsModalVisible={setIsModalVisible}
                    />
                </Modal>
            )}
        </div>
    );
};
