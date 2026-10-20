import {usePageContext} from "framework/ui/content/Page";
import {useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {Row, Form, Col} from "react-bootstrap";
import GuestManagement from "framework/ui/guestbook/GuestManagement";
import {useLocation} from "react-router";

export default function Guests({pageId}) {

  // imports
  const {pageData} = usePageContext();
  const {GuestBooks} = useRestApi();
  const location = useLocation();

  // states
  const [guestBooks, setGuestBooks] = useState([]);
  const [guestBookId, setGuestBookId] = useState(0);

  useEffect(() => {
    // load list of guest books
    GuestBooks.getGuestBooks()
      .then(result => {
        setGuestBooks(result);
      })
  }, [GuestBooks, setGuestBooks])

  useEffect(() => {
    // preselect guest book from URI
    const search = new URLSearchParams(location.search);
    if (search.has('guestbookid')) {
      const guestBookId = parseInt(search.get('guestbookid'));
      setGuestBookId(guestBookId);
    }
  }, [location, setGuestBookId]);

  return <>
    {pageData?.PageID === pageId && (<>
      <Row>
        <Form.Label
          column={'sm'}
          xs={2}
          htmlFor="GuestBook"
          className="text-nowrap"
        >
          Guest Book
        </Form.Label>
        <Col>
          <Form.Select
            name={"GuestBook"}
            size="sm"
            value={guestBookId}
            onChange={(e) => setGuestBookId(parseInt(e.target.value))}
          >
            <option value={0}>(select a guest book)</option>
            {guestBooks.map((guestBook) => (
              <option key={guestBook.GuestBookID} value={guestBook.GuestBookID}>{guestBook.GuestBookName}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <GuestManagement guestBookId={guestBookId} pageId={pageId}/>
    </>)}
  </>;
}