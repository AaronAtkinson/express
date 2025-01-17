import {
  createTag,
  getMetadata,
} from '../../scripts/utils.js';

function decorateFAQBlocks(block) {
  const showSchema = getMetadata('show-faq-schema');
  const faqs = [];
  const entities = [];
  const $rows = Array.from(block.children);
  $rows.forEach(($row) => {
    const $cells = Array.from($row.children);
    const $question = $cells[0];
    const $answer = $cells[1];
    const question = $question.textContent.trim();
    const answer = $answer.innerHTML;
    faqs.push({
      question, answer,
    });
  });

  block.innerHTML = '';
  faqs.forEach((faq) => {
    const { question, answer } = faq;

    const $accordion = createTag('div', { class: 'faq-accordion' });
    block.append($accordion);

    const $questionDiv = createTag('h3', { class: 'faq-question' });
    $accordion.append($questionDiv);
    $questionDiv.innerHTML = question;

    const $answerDiv = createTag('div', { class: 'faq-answer' });
    $accordion.append($answerDiv);
    $answerDiv.innerHTML = answer;

    entities.push({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    });
  });

  if (showSchema !== 'no') {
    const $schemaScript = document.createElement('script');
    $schemaScript.setAttribute('type', 'application/ld+json');
    $schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: entities,
    });
    document.head.appendChild($schemaScript);
  }

  // find previous h2 and move it in the FAQ
  const section = block.closest('.section');
  if (section && section.previousElementSibling) {
    const previousSection = section.previousElementSibling;
    const h2 = previousSection.querySelector('div > h2:last-of-type');
    // make sure there is no other element
    if (h2 && !h2.nextElementSibling) {
      const previous = h2.previousElementSibling;
      block.before(h2);

      if (!previous) {
        // remove empty previous section
        previousSection.remove();
      }
    }
  }
}

export default async function decorate(block) {
  decorateFAQBlocks(block);

  const phoneNumberTags = block.querySelectorAll('a[title="{{business-sales-numbers}}"]');
  if (phoneNumberTags.length > 0) {
    const { formatSalesPhoneNumber } = await import('../../scripts/utils/pricing.js');
    await formatSalesPhoneNumber(phoneNumberTags);
  }
}
