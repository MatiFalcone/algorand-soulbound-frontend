import { Formik, Field, Form } from 'formik';

export const Basic = () => (
  <div>
    <h1>Mint SoulBound Token</h1>
    <br />
    <Formik
      initialValues={{
        orderId: '',
        company: '',
        email: '',
      }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
        >
      <Form>
        <label htmlFor="orderId">Order ID</label>
        <Field id="orderId" name="orderId" placeholder="#123" />

        <label htmlFor="company">Company</label>
        <Field id="company" name="company" placeholder="Cannabis Business" />

        <label htmlFor="email">Email</label>
        <Field
          id="email"
          name="email"
          placeholder="jane@acme.com"
          type="email"
        />
        <button type="submit">Issue Certificate</button>
      </Form>
    </Formik>
  </div>
);