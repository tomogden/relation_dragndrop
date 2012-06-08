<?php
/**
 * @file
 * Configure the settings form for the relation_dragndrop module.
 */

 /**
 * Form function, called by drupal_get_form()
 * in relation_dragndrop_menu().
 */
function relation_dragndrop_form($form, &$form_state) {
  $form['relation_dragndrop_domains'] = array(
    '#type' => 'textfield',
    '#title' => t('Approved domains'),
    '#default_value' => variable_get('relation_dragndrop_domains'),
    '#description' => t('Enter the email domains approved for entry, separated by commas.'),
    '#required' => TRUE,
  );

  $form['relation_dragndrop_description'] = array(
    '#type' => 'textfield',
    '#title' => t('Mail field description'),
    '#default_value' => variable_get('relation_dragndrop_description'),
    '#description' => t('Optionally, enter an custom description of what you want entered into the email field or the domains that will be approved. If left empty, the default description will be used.'),
    '#required' => FALSE,
  );

  return system_settings_form($form);
}

/**
 * Implements hook_form_alter().
 *
 */
function relation_dragndrop_form_alterTEST(&$form, &$form_state, $form_id) {
  switch ($form_id) {
    case 'user_register_form':
      if (isset($form['account']) && is_array($form['account'])) {
        $form['account']['mail']['#title'] = t('E-mail');
      }
      else {
        $form['mail']['#title'] = t('E-mail');
      }
      break;
  }
}
