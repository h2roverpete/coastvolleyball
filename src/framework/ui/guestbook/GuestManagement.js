import {
  Row,
  Form,
  Col,
  Button,
  Table,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Container,
  Spinner
} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import {usePageContext} from "../content/Page";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {BsSortDown, BsSortUp, BsEnvelope} from "react-icons/bs";
import "./GuestManagement.css";

export default function GuestManagement({pageId, guestBookId}) {

  // imports
  const {pageData} = usePageContext();
  const {hasPermission} = useAuth();
  const {GuestBooks} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  // states
  const [guestBookData, setGuestBookData] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);
  const [guestData, setGuestData] = useState(false);
  const [guestIndex, setGuestIndex] = useState(-1);
  const [searching, setSearching] = useState(false);

  const sortFunction = useCallback((a, b) => {

    switch (typeof a[sortKey]) {
      case 'number':
        const numA = a[sortKey] ? a[sortKey] : 0;
        const numB = b[sortKey] ? b[sortKey] : 0;
        return sortAscending ? numA - numB : numB - numA;
      case 'string':
        const stringA = a[sortKey] ? a[sortKey] : '';
        const stringB = b[sortKey] ? b[sortKey] : '';
        return sortAscending ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA);
      default:
        return 0;
    }
  }, [sortKey, sortAscending]);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.GUESTBOOK, Permission.ADMIN));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (guestBookId) {
      GuestBooks.getGuestBook(guestBookId)
        .then(result => {
          setGuestBookData(result);
          setGuestIndex(-1);
        })
        .catch(err => showErrorAlert(`Error getting guest book details.`, err));
    }
  }, [guestBookId, setGuestBookData, GuestBooks, showErrorAlert]);

  useEffect(() => {
    if (guestIndex >= 0) {
      setGuestData(searchResults[guestIndex]);
    } else {
      setGuestData(null);
    }
  }, [searchResults, guestIndex, setGuestData]);

  useEffect(() => {
    setSearchResults([]);
    setSortKey('Created');
    setSortAscending(false);
  }, [guestBookId, setSearchResults]);

  useEffect(() => {
    // sort guest book list on change
    setSearchResults(prevValue => [...prevValue.sort(sortFunction)]);
  }, [sortKey, sortAscending, sortFunction]);

  function onSearch() {
    setSearching(true);
    setSearchResults([]);
    GuestBooks.searchGuestBook(guestBookId, searchText)
      .then(result => {
        result.sort(sortFunction);
        setSearchResults(result);
        setSearching(false);
      })
      .catch(err => {
        showErrorAlert(`Error searching guest book.`, err)
        setSearching(false);
      });
  }

  function onSortBy(key) {
    if (sortKey !== key) {
      console.debug(`Sort by ${key}`);
      setSortKey(key);
      setSortAscending(true);
    } else {
      console.debug(`Sort ascending ${!sortAscending}`);
      setSortAscending(!sortAscending);
    }
  }

  function next() {
    if (guestIndex <= searchResults.length - 1) {
      setGuestIndex(guestIndex + 1);
    }
  }

  function previous() {
    if (guestIndex > 0) {
      setGuestIndex(guestIndex - 1);
    }
  }

  function onDelete() {
    if (guestData) {
      GuestBooks.deleteGuest(guestData.GuestBookID, guestData.GuestID)
        .then(result => {
          const newResults = searchResults.filter((item) => item.GuestID !== result.GuestID);
          setSearchResults(newResults);
          setGuestData(newResults[guestIndex]);
        })
    }
  }

  return <>
    {pageId === pageData.PageID && guestBookId > 0 && canEdit && (<>
      <Row className="mt-2">
        <Form.Label
          column={'sm'}
          xs={2}
          htmlFor="SearchText"
          className="text-nowrap"
        >
          Search For
        </Form.Label>
        <Col>
          <Form.Control
            type="search"
            name={"SearchText"}
            size="sm"
            value={searchText}
            placeholder={'(all guests)'}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={'auto'}>
          <Button
            variant="primary"
            size="sm"
            onClick={onSearch}
            style={{width: '60px'}}
            disabled={searching}
          >
            {searching ? <Spinner size={'sm'}/> : <>Search</>}
          </Button>
        </Col>
      </Row>
      {searchResults.length > 0 && (<>
        <Table
          hover
          responsive
          style={{
            height: 'auto',
            flexGrow: 1,
            overflowY: 'scroll'
          }}
          className="mt-2"
        >
          <thead style={{position: 'sticky', top: 0,}}>
          <tr>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('GuestID')}
              style={{cursor: 'pointer'}}
            >
              ID
              {sortKey === 'GuestID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
            </th>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('LastName')}
              style={{cursor: 'pointer'}}
            >
              Name
              {sortKey === 'LastName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
            </th>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('Email')}
              style={{cursor: 'pointer'}}
            >
              Email
              {sortKey === 'Email' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
            </th>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('Created')}
              style={{cursor: 'pointer'}}
            >
              Date
              {sortKey === 'Created' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
            </th>
            <th
              className={'text-nowrap'}
              style={{cursor: 'pointer'}}
            >
              Feedback
            </th>
          </tr>
          </thead>
          <tbody>
          {searchResults.map((item, index) => (
            <tr
              key={item.GuestID}
              className={'GuestRow'}
              onClick={() => setGuestIndex(index)}
            >
              <td>{item.GuestID}</td>
              <td>{item.FirstName} {item.LastName}</td>
              <td>{item.Email}</td>
              <td>{item.Created ? (new Date(item.Created)).toLocaleDateString() : `(none)`}</td>
              <td>{item.Feedback.map((feedback) => (
                <BsEnvelope
                  key={feedback.GuestFeedbackID}
                  className={'me-2'}
                />
              ))}</td>
            </tr>
          ))}
          </tbody>
        </Table>
        <Modal show={guestData} onHide={() => setGuestIndex(-1)}>
          <ModalHeader closeButton>
            <h5>Guest Feedback</h5>
          </ModalHeader>
          <ModalBody>
            <div
              style={{
                height: '70dvh',
                overflowY: 'scroll',
              }}
            >
              {guestData && guestBookData && (<Container>
                {guestData.Feedback.length > 0 ? (<>
                  {guestData.Feedback.map((feedbackData, index) => (<>
                    {index > 0 && (<Row className={"mt-4 mb-4"}
                                        style={{height: '1px', backgroundColor: 'var(--bs-border-color)'}}></Row>)}
                    <Row className={"mb-4"}>Date: {new Date(guestData.Created).toLocaleDateString()}</Row>
                    <Row
                      dangerouslySetInnerHTML={{__html: getFeedbackText(guestData, guestBookData, feedbackData).replaceAll('\n', '<br/>')}}/>
                  </>))}
                </>) : (<>
                  <Row className={"mb-4"}>Date: {new Date(guestData.Created).toLocaleDateString()}</Row>
                  <Row
                    dangerouslySetInnerHTML={{__html: getFeedbackText(guestData, guestBookData, undefined).replaceAll('\n', '<br/>')}}/>
                </>)}

              </Container>)}
            </div>
          </ModalBody>
          <ModalFooter>
            <Row className="container-fluid m-0 p-0">
              <Col className="d-flex justify-content-start m-0 p-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={previous}
                  disabled={guestIndex <= 0}
                  className="me-2"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={next}
                  disabled={guestIndex >= searchResults.length - 1}
                >
                  Next
                </Button>
              </Col>
              <Col className="d-flex justify-content-end m-0 p-0">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={onDelete}
                  className="me-2"
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setGuestIndex(-1)}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </Modal>
      </>)}
    </>)}
  </>;
}

/**
 * Return body text for a guest email.
 *
 * @param guestData {GuestData}
 * @param guestBookData {GuestBookConfig}
 * @param feedbackData {GuestFeedbackData}
 * @returns {string}
 */
function getFeedbackText(guestData, guestBookData, feedbackData) {
  let text = `Name: ${guestData.FirstName} ${guestData.LastName}`;

  text += guestData.Address1 ? `\n\nAddress:\n${guestData.Address1}` : '';
  text += guestData.Address2 ? `\n${guestData.Address2}` : '';
  text += (guestData.City + guestData.State + guestData.Zip).length > 0 ? `\n${guestData.City}, ${guestData.State} ${guestData.Zip}` : '';

  text += guestData.Country ? `\n\nCountry: ${guestData.Country}` : '';

  text += (guestData.DayPhone + guestData.EveningPhone + guestData.Fax).length ? '\n' : ''; // spacer

  text += guestData.DayPhone ? `\nPhone: ${guestData.DayPhone}` : '';
  text += guestData.EveningPhone ? `\nMobile: ${guestData.EveningPhone}` : '';
  text += guestData.Fax ? `\nAlternate: ${guestData.Fax}` : '';

  text += guestData.Email ? `\n\nEmail: ${guestData.Email}` : '';

  text += guestData.MailingList ? `\n\n[X] Add to mailing list` : '';

  text += guestData.ContactMethod ? `\n\nContact by: ${guestData.ContactMethod}` : '';

  if (feedbackData) {

    // lodging fields
    text += feedbackData.ArrivalDate ? `\n\nArrival: ${new Date(feedbackData.ArrivalDate).toDateString()}` : '';
    text += feedbackData.DepartureDate ? `\nDeparture: ${new Date(feedbackData.DepartureDate).toDateString()}` : '';
    text += feedbackData.NumberOfGuests ? `\nGuests: ${feedbackData.NumberOfGuests}` : '';

    // parse custom fields
    let first = true;
    for (let i = 1; i <= 8; i++) {
      if (guestBookData[`Custom${i}Type`] && feedbackData.hasOwnProperty(`Custom${i}`) && feedbackData[`Custom${i}`].length) {
        if (first) {
          // spacer
          text += '\n';
          first = false;
        }
        text += `\n${guestBookData[`Custom${i}Label`]}: ${feedbackData[`Custom${i}`]}`;
      }
    }

    text += feedbackData.FeedbackText?.length ? `\n\n${guestBookData.TextCaption ? guestBookData.TextCaption : 'Questions/Comments'}:\n${feedbackData.FeedbackText}` : '';

  }
  return text;
}