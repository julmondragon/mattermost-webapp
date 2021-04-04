// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';

import InfiniteScroll from '../common/infinite_scroll.jsx';
import QuickInput from 'components/quick_input';
import UserList from 'components/user_list.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n';

class SearchableUserList extends React.PureComponent {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        usersPerPage: PropTypes.number,
        total: PropTypes.number,
        extraInfo: PropTypes.object,
        nextPage: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired,
        actions: PropTypes.arrayOf(PropTypes.func),
        actionProps: PropTypes.object,
        actionUserProps: PropTypes.object,
        focusOnMount: PropTypes.bool,
        renderCount: PropTypes.func,
        filter: PropTypes.string,
        renderFilterRow: PropTypes.func,
        page: PropTypes.number.isRequired,
        term: PropTypes.string.isRequired,
        onTermChange: PropTypes.func.isRequired,
        intl: PropTypes.any,
        isDisabled: PropTypes.bool,

        // the type of user list row to render
        rowComponentType: PropTypes.func,
    };

    static defaultProps = {
        users: [],
        usersPerPage: 50,
        extraInfo: {},
        actions: [],
        actionProps: {},
        actionUserProps: {},
        showTeamToggle: false,
        focusOnMount: false,
    };

    componentDidMount() {
        this.focusSearchBar();
    }

    componentDidUpdate(prevProps) {
        if (this.props.page !== prevProps.page || this.props.term !== prevProps.term) {
            this.refs.userList.scrollToTop();
        }
    }

    nextPage = async () => {
        const {nextPage} = this.props;

        await nextPage();
    }

    focusSearchBar = () => {
        if (this.props.focusOnMount) {
            this.refs.filter.focus();
        }
    }

    handleInput = (e) => {
        this.props.onTermChange(e.target.value);
        this.props.search(e.target.value);
    }

    renderCount = (users) => {
        if (!users) {
            return null;
        }

        if (this.props.filter) {
            return null;
        }

        const count = users.length;
        const total = this.props.total;
        const isSearch = Boolean(this.props.term);

        let startCount;
        let endCount;
        if (isSearch) {
            startCount = -1;
            endCount = -1;
        } else {
            startCount = this.props.page * this.props.usersPerPage;
            endCount = Math.min(startCount + this.props.usersPerPage, total);
            if (this.props.users.length < endCount) {
                endCount = this.props.users.length;
            }
        }

        if (this.props.renderCount) {
            return this.props.renderCount(count, this.props.total, startCount, endCount, isSearch);
        }

        if (this.props.total) {
            if (isSearch) {
                return (
                    <FormattedMessage
                        id='filtered_user_list.countTotal'
                        defaultMessage='{count, number} {count, plural, one {member} other {members}} of {total, number} total'
                        values={{
                            count,
                            total,
                        }}
                    />
                );
            }

            return (
                <FormattedMessage
                    id='filtered_user_list.countTotalPage'
                    defaultMessage='{startCount, number} - {endCount, number} {count, plural, one {member} other {members}} of {total, number} total'
                    values={{
                        count,
                        startCount: startCount + 1,
                        endCount,
                        total,
                    }}
                />
            );
        }

        return null;
    }

    render() {
        let usersToDisplay;
        const {formatMessage} = this.props.intl;

        if (this.props.term || !this.props.users) {
            usersToDisplay = this.props.users;
        } else if (!this.props.term) {
            const pageStart = this.props.page * this.props.usersPerPage;
            let pageEnd = pageStart + this.props.usersPerPage;
            if (this.props.users.length < pageEnd) {
                pageEnd = this.props.users.length;
            }

            usersToDisplay = this.props.users.slice(0, pageEnd);
        }

        let filterRow;
        if (this.props.renderFilterRow) {
            filterRow = this.props.renderFilterRow(this.handleInput);
        } else {
            const searchUsersPlaceholder = {id: t('filtered_user_list.search'), defaultMessage: 'Search users'};
            filterRow = (
                <div className='col-xs-12'>
                    <label
                        className='hidden-label'
                        htmlFor='searchUsersInput'
                    >
                        <FormattedMessage
                            id='filtered_user_list.search'
                            defaultMessage='Search users'
                        />
                    </label>
                    <QuickInput
                        id='searchUsersInput'
                        ref='filter'
                        className='form-control filter-textbox'
                        placeholder={searchUsersPlaceholder}
                        inputComponent={LocalizedInput}
                        value={this.props.term}
                        onInput={this.handleInput}
                        aria-label={formatMessage(searchUsersPlaceholder).toLowerCase()}
                    />
                </div>
            );
        }

        return (
            <div className='filtered-user-list'>
                <div className='filter-row'>
                    {filterRow}
                    <div className='col-sm-12'>
                        <span
                            id='searchableUserListTotal'
                            className='member-count pull-left'
                            aria-live='polite'
                        >
                            {this.renderCount(usersToDisplay)}
                        </span>
                    </div>
                </div>
                <div className='more-modal__list'>
                    <InfiniteScroll
                        callBack={this.nextPage}
                        styleClass='filtered-user-all'
                        totalItems={this.props.total}
                        itemsPerPage={this.props.usersPerPage}
                        bufferValue={1500}
                        pageNumber={this.props.page}
                        loaderStyle={{padding: '0px', height: '40px'}}
                    >
                        <UserList
                            ref='userList'
                            users={usersToDisplay}
                            extraInfo={this.props.extraInfo}
                            actions={this.props.actions}
                            actionProps={this.props.actionProps}
                            actionUserProps={this.props.actionUserProps}
                            rowComponentType={this.props.rowComponentType}
                            isDisabled={this.props.isDisabled}
                        />
                    </InfiniteScroll>
                </div>
            </div>
        );
    }
}

export default injectIntl(SearchableUserList);
/* eslint-enable react/no-string-refs */
