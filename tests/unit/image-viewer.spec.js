import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import ImageViewer from "@/components/ImageViewer.vue";
import { store } from "../../src/store";

describe("ImageViewer.vue", () => {
  it("renders props.msg when passed", () => {
    const wrapper = shallowMount(ImageViewer, {
      propsData: { $store: store }
    });
    // TODO: not working yet
    wrapper.addWidget({
      _rintf: true,
      name: "My Form",
      type: "form",
      form_submit_callback: values => {
        console.log(values);
      },
      fields: [
        {
          type: "tags",
          label: "Tag(s)",
          options: ["drama", "sci-fi"],
          placeholder: "Add a tag2"
        },
        {
          type: "files",
          label: "my-files",
          required: false
        },
        {
          slot: "tagInput",
          props: {
            label: "book tags",
            options: ["drama", "sci-fi"]
          }
        },
        {
          type: "button",
          label: "select a file",
          callback: () => {
            // do something here
            // you can return some value here
            // and it will be filled as part of the form
            return 1;
          }
        },
        {
          label: "First Name",
          value: "fir",
          rules: {
            min: 4,
            max: 20
          }
        },
        {
          label: "Country",
          type: "select",
          iconLeft: "globe-americas",
          placeholder: "Select your option",
          options: [
            "Afghanistan",
            "Åland Islands",
            "Albania",
            "Algeria",
            "...",
            "Western Sahara",
            { text: "Yemen", value: "YE" },
            { text: "Zambia", value: "ZB", selected: true },
            "Zimbabwe"
          ]
        },
        {
          html:
            "<div class='box'><article class='media'><div class='media-left'><figure class='image is-64x64'><img src='https://bulma.io/images/placeholders/64x64.png' alt='Image'></figure></div><div class='media-content'><div class='content'><p><strong class='has-text-info'>Info</strong><br>You can also pass html like this box</p></div>"
        }
      ]
    });
    expect(wrapper.text()).to.include("Layers");
  });
});
