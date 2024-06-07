import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import {
    ISelectOption,
    ISelectUserOption,
    MultiCreatableUserSelect,
} from 'components/UserSelect/MultiCreatableUserSelect';
import { AsyncButton } from 'ui/AsyncButton/AsyncButton';
import { Button } from 'ui/Button/Button';
import { Modal } from 'ui/Modal/Modal';

interface FormInputs {
    users: ISelectOption[];
}

interface IProps {
    onRequestReviewClick: (reviewer_ids: number[]) => Promise<any>;
}

const QueryCellRequestReviewForm: React.FC<{
    onRequestReviewClick: (reviewer_ids: number[]) => Promise<any>;
    setIsModalVisible: (isVisible: boolean) => void;
}> = ({ onRequestReviewClick, setIsModalVisible }) => {
    // const validationSchema = Yup.object({
    //     users: Yup.array()
    //         .of(
    //             Yup.object().shape({
    //                 value: Yup.lazy((value) =>
    //                     typeof value === 'number'
    //                         ? Yup.number().required()
    //                         : Yup.string().required()
    //                 ),
    //                 label: Yup.mixed().notRequired(),
    //                 isUser: Yup.boolean().notRequired(),
    //             })
    //         )
    //         .required('Users are required'),
    // });

    const onSubmit = async (
        values: FormInputs,
        { setSubmitting, setStatus }
    ) => {
        try {
            const reviewerIds = values.users
                .filter(
                    (user: ISelectOption) => 'isUser' in user && user.isUser
                )
                .map((user: ISelectUserOption) => user.value);
            console.log('REVIEWERS!!', reviewerIds);

            await onRequestReviewClick(reviewerIds);
            setIsModalVisible(false);
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }

        setSubmitting(false);
    };

    return (
        <Formik initialValues={{ users: [] }} onSubmit={onSubmit}>
            {({
                submitForm,
                values,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
            }) => (
                <Form>
                    <Field
                        name="users"
                        component={MultiCreatableUserSelect}
                        value={values.users}
                        onChange={(value: ISelectOption[]) =>
                            setFieldValue('users', value)
                        }
                        selectProps={{
                            isClearable: true,
                            placeholder: 'Select users...',
                            onBlur: () => setFieldTouched('users', true),
                        }}
                    />
                    <ErrorMessage name="users" component="div" />
                    <AsyncButton
                        disabled={isSubmitting}
                        onClick={submitForm}
                        title={'Submit'}
                    />
                </Form>
            )}
        </Formik>
    );
};

export const QueryCellRequestReviewButton: React.FunctionComponent<IProps> = ({
    onRequestReviewClick,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

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
                    <QueryCellRequestReviewForm
                        onRequestReviewClick={onRequestReviewClick}
                        setIsModalVisible={setIsModalVisible}
                    />
                </Modal>
            )}
        </div>
    );
};
