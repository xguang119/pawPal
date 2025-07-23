import emailjs from 'emailjs-com';
//----the email will be send from wliu107@ucsc.edu------

emailjs.init('AlJdHzVYqtjhhs46q');//public key,don't change

export async function sendAcceptanceEmail(post) {
  if (!post || post.contact_type !== 'email') return;

  try {
    const result = await emailjs.send(
      'service_a4bdl1b',//service id,don't change
      'template_z4pdpbp',//template id,don't change
      {
        username: post.username,
        service: post.service,
        contact: post.contact
      }
    );

    console.log('Email sent successfully:', result.status, result.text);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
