import {useSiteContext} from "../content/Site";
import {Col, Form, Row} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useFormData} from "./FormEditor";
import {useEffect} from "react";
import CrudButtons from "./CrudButtons";
import {isValidUrl, isValidBucketName} from "../../util/Validators";

/**
 * @typedef SiteConfigProps
 *
 * @property {SiteData} [siteData]              Site data to use instead of SiteContext.siteData
 * @property {function(SiteData)} [onUpdate]    Receive callback on data update.
 * @property {function(SiteData)} [onDelete]    Show delete button and receive callback on delete.
 * @property {function()} [onCancel]            Show cancel button and receive callback on cancel.
 * @property {string} [className]               Class name(s) for container <div>
 * @property {Object} [style]                   Style for container <div>
 */

/**
 * Site configuration fields & database updates.
 *
 * @param props {SiteConfigProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SiteConfig(props) {

  // imports
  const {siteData, setSiteData, showErrorAlert} = useSiteContext();
  const {Sites} = useRestApi();

  /** @type FormDataAPI<SiteData> */
  const formData = useFormData();

  useEffect(() => {
    if (props.siteData) {
      // use provided site from props
      formData.setData(props.siteData);
    } else if (siteData) {
      // get site from context
      formData.setData(siteData);
    }
  }, [siteData, formData, props.siteData]);

  function onUpdate() {
    console.debug(`Updating site properties...`);
    Sites.insertOrUpdateSite(formData.edits).then((result) => {
      console.debug(`Site updated.`);
      formData.update(result);
      if (!props.siteData) {
        // update if we are getting data from site context
        setSiteData(result);
      }
      props.onUpdate?.(result);
    }).catch((err) => {
      console.error(`Error updating site properties.`, err);
    })
  }

  function onDelete() {
    Sites.deleteSite(formData.edits.SiteID)
      .then(result => {
        props.onDelete?.(result);
      })
      .catch((err) => {
        showErrorAlert(err);
      });
  }

  function isDataValid() {
    return formData.edits?.SiteName?.length > 0
      && (!formData.edits.SiteRootUrl || isValidUrl(formData.edits?.SiteRootUrl))
      && (!formData.edits.SiteBucketName || isValidBucketName(formData.edits?.SiteBucketName))
  }

  return (<>
    {siteData && (
      <div
        className={`SiteConfig ${props.className ? props.className : ''}`}
        style={props.style}
      >
        <h5>Site Properties</h5>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteName'}>Site Name</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteName'}
              isValid={formData.isTouched('SiteName') && formData.edits?.SiteName?.length > 0}
              isInvalid={formData.isTouched('SiteName') && !formData.edits?.SiteName}
              value={formData.edits?.SiteName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} htmlFor={'SiteRootUrl'}>URL</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteRootUrl'}
              isValid={formData.isTouched('SiteRootUrl') && isValidUrl(formData.edits?.SiteRootUrl)}
              isInvalid={formData.isTouched('SiteRootUrl') && formData.edits.SiteRootUrl?.length && !isValidUrl(formData.edits?.SiteRootUrl)}
              value={formData.edits?.SiteRootUrl || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteRootUrl', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} htmlFor={'SiteStyle'}>Style</Form.Label>
            <Form.Select
              size={'sm'}
              name={'SiteStyle'}
              value={formData.edits?.SiteStyle || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteStyle', value: e.target.value})}
            >
              <option value={``}>none</option>
              <option value={`bootstrap.min.css`}>Bootstrap</option>
              <option value={`superhero.min.css`}>Superhero</option>
              <option value={`cyborg.min.css`}>Cyborg</option>
              <option value={`sandstone.min.css`}>Sandstone</option>
              <option value={`yeti.min.css`}>Yeti</option>
              <option value={`darkly.min.css`}>Darkly</option>
              <option value={`pulse.min.css`}>Pulse</option>
              <option value={`simplex.min.css`}>Simplex</option>
              <option value={`solar.min.css`}>Solar</option>
              <option value={`cosmo.min.css`}>Cosmo</option>
              <option value={`flatly.min.css`}>Flatly</option>
              <option value={`minty.min.css`}>Minty</option>
              <option value={`sketchy.min.css`}>Sketchy</option>
            </Form.Select>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} htmlFor={'SiteTheme'}>Theme</Form.Label>
            <Form.Select
              size={'sm'}
              id={'SiteTheme'}
              value={formData.edits?.SiteTheme || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteTheme', value: e.target.value})}
            >
              <option value={`light`}>Light</option>
              <option value={`dark`}>Dark</option>
            </Form.Select>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} htmlFor={'SiteBucketName'}>S3 Bucket</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteBucketName'}
              isValid={formData.isTouched('SiteBucketName') && isValidBucketName(formData.edits?.SiteBucketName)}
              isInvalid={formData.isTouched('SiteBucketName') && !isValidBucketName(formData.edits?.SiteBucketName)}
              value={formData.edits?.SiteBucketName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteBucketName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={''} htmlFor={'GoogleClientID'}>Google Client ID</Form.Label>
            <Form.Control
              size={'sm'}
              id={'GoogleClientID'}
              placeholder={'G-XXXXXXXXXX'}
              value={formData.edits?.GoogleClientID || ''}
              onChange={(e) => formData.onDataChanged({name: 'GoogleClientID', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Check
              checked={formData.edits?.NoIndex || ''}
              label={`Don't index site`}
              onChange={(e) => formData.onDataChanged({name: 'NoIndex', value: e.target.checked})}
            />
          </Col>
        </Row>
        <CrudButtons
          data={formData.edits}
          keyName={'SiteID'}
          type={'Site'}
          onCancel={props.onCancel}
          onUpdate={onUpdate}
          onDelete={props.onDelete ? onDelete : undefined}
          isDataValid={isDataValid}
        />
      </div>
    )}
  </>);
}