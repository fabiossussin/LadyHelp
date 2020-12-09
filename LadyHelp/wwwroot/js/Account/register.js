(function ($, $sl) {
  const appName = 'registerUser';
  $sl.apps.register = $sl.apps.register || {};
  let pb = $sl.apps.register.user = () => {
    main.init();
    main.attachListeners();
  };
  let main = {};
  main.$container = (query) => {
    let $el = $(`[name="${appName}"]`);
    return query ? $el.find(query) : $el;
  };
  main.init = function () {
    main.$container('[name="personal-data"]').addClass('span-selected')
    main.$container('[name="personal-data-info"]').show();
  };
  main.attachListeners = function () {
    const suffix = `.sl.${appName}`;
    main.bindHtml('service', '[name=service-input]');
    main.bindHtml('auxService', '[name=auxServices]');

    main.$container().off(suffix);
    main.$container().on(`click${suffix}`, '[name=account-data]', main.onClickAccountData);
    main.$container().on(`click${suffix}`, '[name=personal-data]', main.onClickPersonalData);
    main.$container().on(`click${suffix}`, '[name=worker-data]', main.onClickWorkerData);
    main.$container().on(`click${suffix}`, '[name=address]', main.onClickAddress);
    main.$container().on(`click${suffix}`, '[name=remove-image]', main.onClickRemoveImage);
    main.$container().on(`click${suffix}`, '[name=add-service]', main.onClickAddService);
    main.$container().on(`change${suffix}`, '[name=imageProfile]', main.onChangeImageProfile);
  };
  main.onClickAccountData = () => {
    main.onClickRemoveCss();
    main.onClickHideDiv();
    main.$container('[name=account-data]').addClass('span-selected');
    main.$container('[name="account-data-info"]').show();
  }
  main.onClickPersonalData = () => {
    main.onClickRemoveCss();
    main.onClickHideDiv();
    main.$container('[name=personal-data]').addClass('span-selected');
    main.$container('[name="personal-data-info"]').show();
  }
  main.onClickWorkerData = () => {
    main.onClickRemoveCss();
    main.onClickHideDiv();
    main.$container('[name=worker-data]').addClass('span-selected');
    main.$container('[name="worker-data-info"]').show();
  }
  main.onClickAddress = () => {
    main.onClickRemoveCss();
    main.onClickHideDiv();
    main.$container('[name=address]').addClass('span-selected');
    main.$container('[name="address-info"]').show();
  }
  main.onClickRemoveCss = function () {
    main.$container('.form-title').removeClass('span-selected');
  }
  main.onClickHideDiv = function () {
    main.$container('.form-content').hide();
  }
  main.onClickAddService = function () {
    if (!main.allServices)
      main.allServices = [];

    if (main.service) {
      main.allServices.push(main.service);
      main.$container('[name="services"]').append(main.serviceLabel.replace(/{{value}}/gi, main.service));
      main.auxService = main.allServices.join(';');
      main.service = '';
    }
  }
  main.onChangeImageProfile = function () {
    let reader = new FileReader();
    reader.readAsDataURL((main.$container('[name="imageProfile"]').prop('files'))[0]);
    reader.onload = async () => {
      main.$container('[name="without-image-profile"]').hide();
      main.$container('[name="imageProfile"]').hide();
      main.$container('[name="image-profile"]').css('display', 'flex')
      main.$container('[name="image-profile"]').css('background-image', `url(${reader.result.toString()})`)
    }
  }
  main.onClickRemoveImage = function () {
    main.$container('[name="image-profile"]').css('display', 'none')
    main.$container('[name="image-profile"]').css('background-image', 'url()')
    main.$container('[name="without-image-profile"]').show();
    main.$container('[name="imageProfile"]').show();
  }
  main.serviceLabel = `
  <div class="service">
    <span>{{value}}</span>
  </div>                              
  `;

  $(document).ready(pb);
})(window.jQuery, $sl);