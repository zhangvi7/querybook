import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BoundQueryEditor } from 'components/QueryEditor/BoundQueryEditor';
import { IQueryExecution } from 'const/queryExecution';
import { queryStatusToStatusIcon } from 'const/queryStatus';
import { useResource } from 'hooks/useResource';
import { navigateWithinEnv } from 'lib/utils/query-string';
import * as adhocQueryActions from 'redux/adhocQuery/action';
import * as dataSourcesActions from 'redux/dataSources/action';
import { currentEnvironmentSelector } from 'redux/environment/selector';
import { queryEngineByIdEnvSelector } from 'redux/queryEngine/selector';
import * as queryExecutionActions from 'redux/queryExecutions/action';
import { myUserInfoSelector } from 'redux/user/selector';
import {
    QueryExecutionResource,
    QueryExecutionReviewResource,
} from 'resource/queryExecution';
import { Button } from 'ui/Button/Button';
import { StatusIcon } from 'ui/StatusIcon/StatusIcon';
import { Tag } from 'ui/Tag/Tag';
import { Title } from 'ui/Title/Title';

import { QueryViewEditorShareButton } from './QueryViewEditorShareButton';

export const QueryViewEditor: React.FunctionComponent<{
    queryExecution: IQueryExecution;
}> = ({ queryExecution }) => {
    const queryEngineById = useSelector(queryEngineByIdEnvSelector);
    const queryEngine = queryEngineById[queryExecution.engine_id];

    const userInfo = useSelector(myUserInfoSelector);
    const environment = useSelector(currentEnvironmentSelector);
    const showAccessControls =
        queryExecution.uid === userInfo.id && !environment.shareable;

    const {
        isLoading,
        isError,
        data: isReviewer,
        forceFetch,
    } = useResource(
        React.useCallback(
            () => QueryExecutionReviewResource.getIsReviewer(queryExecution.id),
            [queryExecution.id]
        )
    );

    // if (isLoading) {
    //     return <Loading />;
    // }
    // if (isError) {
    //     return <ErrorMessage>Error Loading DataDoc Schedule</ErrorMessage>;
    // }

    const dispatch = useDispatch();
    const { data: cellInfo } = useResource(
        React.useCallback(
            () => QueryExecutionResource.getDataDoc(queryExecution.id),
            [queryExecution.id]
        )
    );

    // useEffect(() => {
    //     dispatch(fetchIsReviewer({ executionId: queryId }));
    // }, [dispatch, queryId]);

    // use the useSelector hook to access the review status from your Redux store
    // may need new redux state for QueryReview table
    // const isReviewer = useSelector((state: IStoreState) =>
    // Add your logic to check if the current user is a valid reviewer

    // new queryexecutionreview endpoint to check is reviewer and store in redux store

    // TODO: test if the user is logged out case

    // create a new action in your Redux store to fetch the review status from the
    ///backend
    // this action should dispatch a network request to is reviewer API
    //endpoint
    // );

    const goToDataDoc = React.useCallback(() => {
        if (cellInfo != null) {
            const { doc_id: docId, cell_id: cellId } = cellInfo;
            navigateWithinEnv(
                `/datadoc/${docId}/?cellId=${cellId}&executionId=${queryExecution.id}`
            );
        }
    }, [queryExecution, cellInfo]);

    const exportToAdhocQuery = React.useCallback(() => {
        dispatch(
            adhocQueryActions.receiveAdhocQuery(
                {
                    query: queryExecution.query,
                    executionId: queryExecution.id,
                    engineId: queryExecution.engine_id,
                },
                environment.id
            )
        );
        navigateWithinEnv('/adhoc/');
    }, [queryExecution, environment.id]);

    const handleApprove = React.useCallback(async () => {
        try {
            await QueryExecutionReviewResource.update(
                queryExecution.id,
                userInfo.id,
                true
            );
            alert('Query approved successfully!');
        } catch (error) {
            alert(`Error approving query: ${error.message}`);
        }
    }, [queryExecution.id, userInfo.id]);

    const handleReject = React.useCallback(() => {
        QueryExecutionReviewResource.update(
            queryExecution.id,
            userInfo.id,
            false
        )
            .then(() => {
                alert('Query rejected successfully!');
            })
            .catch((error) => {
                alert(`Error rejecting query: ${error.message}`);
            });
    }, [queryExecution.id, userInfo.id]);

    React.useEffect(() => {
        dispatch(
            dataSourcesActions.fetchFunctionDocumentationIfNeeded(
                queryEngineById[queryExecution.engine_id].language
            )
        );
        if (showAccessControls) {
            dispatch(
                queryExecutionActions.fetchQueryExecutionAccessRequests(
                    queryExecution.id
                )
            );
            dispatch(
                queryExecutionActions.fetchQueryExecutionViewers(
                    queryExecution.id
                )
            );
        }
    }, [queryEngineById, queryExecution]);

    const editorDOM = (
        <div className="editor">
            <BoundQueryEditor
                value={queryExecution.query}
                lineWrapping={true}
                readOnly={true}
                height={'fixed'}
                engine={queryEngine}
            />
        </div>
    );

    const dataCellTitle = cellInfo?.cell_title;
    const queryExecutionTitleDOM = queryExecution ? (
        <div className="flex-row">
            <Title size="med" className="mr16">
                <StatusIcon
                    status={queryStatusToStatusIcon[queryExecution.status]}
                />
                <span className="ml8">Execution {queryExecution.id}</span>
                {dataCellTitle ? (
                    <span className="ml8">{dataCellTitle}</span>
                ) : null}
            </Title>
            <Tag>{queryEngineById[queryExecution.engine_id].name}</Tag>
        </div>
    ) : null;

    const goToDataDocButton =
        cellInfo != null ? (
            <Button
                onClick={goToDataDoc}
                title="Go To DataDoc"
                icon="ArrowRight"
                theme="text"
            />
        ) : null;

    const shareExecutionButton = showAccessControls ? (
        <QueryViewEditorShareButton queryExecution={queryExecution} />
    ) : null;

    const queryReviewDOM = isReviewer ? (
        // && queryExecution.status === QueryExecutionStatus.PENDING_REVIEW ? (
        <div>
            <Button onClick={handleApprove}>Approve</Button>
            <Button onClick={handleReject}>Reject</Button>
        </div>
    ) : null;

    const editorSectionHeader = (
        <div className="editor-section-header horizontal-space-between">
            <div>{queryExecutionTitleDOM}</div>
            <div className="horizontal-space-between">
                {queryReviewDOM}
                {shareExecutionButton}
                <Button
                    onClick={exportToAdhocQuery}
                    title="Edit"
                    icon="Edit"
                    theme="text"
                />
                {goToDataDocButton}
            </div>
        </div>
    );

    const editorSectionDOM = (
        <div className="editor-section">
            {editorSectionHeader}
            {editorDOM}
        </div>
    );

    return editorSectionDOM;
};
