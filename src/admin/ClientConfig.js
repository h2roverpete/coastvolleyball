import {useFormData} from "framework/ui/editor/FormEditor";
import {useEffect} from "react";
import {Col, Form, Row} from "react-bootstrap";
import CrudButtons from "framework/ui/editor/CrudButtons";
import {useRestApi} from "framework/api/RestApi";
import {isValidUrl} from "framework/util/Validators";

export default function ClientConfig({className, style, clientData, onCancel, onUpdate, onDelete, clientList}) {

  const {Auth} = useRestApi();

  const formData = useFormData();
  useEffect(() => {
    formData.setData(clientData);
  }, [clientData, formData]);

  function handleUpdate(data) {
    const client = {...data};
    Auth.insertOrUpdateAuthClient(client)
      .then(result => onUpdate?.(result))
      .catch((error) => console.error(`Error updating client.`, error));
  }

  function handleDelete(data) {
    Auth.deleteAuthClient(data.client_id)
      .then(result => onDelete?.(result))
      .catch((error) => console.error(`Error deleting client.`, error));
  }

  function handleCancel() {
    onCancel?.();
  }

  function isDataValid(data) {
    return data.client_id?.length > 0
      && data.redirect_uri?.length > 0
  }

  function clientExists(client_id) {
    return clientList?.filter(client => client.client_id === client_id).length > 0;
  }

  const labelCols = 5;
  return (
    <div
      className={`ClientConfig ${className ? className : ''}`}
      style={style}
    >
      <h5>OAuth Client Properties</h5>
      <Row className={'mt-4'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'client_id'}
        >
          Client ID (Site URL)
        </Form.Label>
        <Col>
          <Form.Control
            disabled={clientData?.client_id?.length > 0}
            size={'sm'}
            name={'client_id'}
            isValid={formData.isTouched('client_id') && formData.edits.client_id?.length > 0 && !clientExists(formData.edits.client_id)}
            isInvalid={formData.isTouched('client_id') && (!(formData.edits.client_id?.length > 0) || clientExists(formData.edits.client_id))}
            value={formData.edits?.client_id || ''}
            onChange={(e) => formData.onDataChanged({name: 'client_id', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row className={'mt-4'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'redirect_uri'}
        >
          Redirect URI
        </Form.Label>
        <Col>
          <Form.Control
            size={'sm'}
            name={'redirect_uri'}
            isValid={formData.isTouched('redirect_uri') && isValidUrl(formData.edits.redirect_uri)}
            isInvalid={formData.isTouched('redirect_uri') && !isValidUrl(formData.edits.redirect_uri)}
            value={formData.edits?.redirect_uri || ''}
            onChange={(e) => formData.onDataChanged({name: 'redirect_uri', value: e.target.value})}
          />
        </Col>
      </Row>
      <CrudButtons
        data={clientData}
        keyName={'client_id'}
        type={'Client'}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCancel={handleCancel}
        isDataValid={isDataValid}
      />
    </div>
  );
}